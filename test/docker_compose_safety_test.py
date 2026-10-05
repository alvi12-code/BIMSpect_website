"""Config-only tests: no production network/server/secrets required."""

import copy
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("compose_validator", ROOT / "scripts/validate-production-compose.py")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def resolve(file, *args, env=None):
    return json.loads(subprocess.check_output(
        ["docker", "compose", "--project-directory", str(ROOT), "-f", str(file), *args,
         "config", "--format", "json"], cwd=ROOT, env=env, text=True
    ))


class ProductionComposeSafety(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Disable personal .env and COMPOSE_* settings; CI and Mac use identical defaults.
        cls.env = os.environ.copy()
        example_keys = {
            line.split("=", 1)[0] for line in (ROOT / ".env.example").read_text().splitlines()
            if "=" in line and not line.startswith("#")
        }
        for key in tuple(cls.env):
            if key.startswith("COMPOSE_") or key in example_keys:
                del cls.env[key]
        cls.base = resolve(ROOT / "docker-compose.yml", "--env-file", os.devnull, env=cls.env)

    def altered(self):
        return copy.deepcopy(self.base)

    def assert_rejected(self, config, fragment):
        errors = validator.validate(config)
        self.assertTrue(any(fragment in error for error in errors), errors)

    def test_production_defaults_and_alias(self):
        self.assertEqual(validator.validate(self.base), [])
        self.assertEqual(self.base["services"]["web"]["ports"][0]["published"], "3001")
        self.assertEqual(self.base["services"]["nginx-test"]["ports"][0]["published"], "8081")

    def test_exact_incident_bad_compose_is_rejected_after_real_resolution(self):
        text = (ROOT / "docker-compose.yml").read_text()
        text = text.replace('"127.0.0.1:${MARKETING_PORT:-3001}:3000"', '"3000:3000"')
        text = text.replace("marketing_proxy:", "bimspect_network:")
        text = text.replace("- marketing_proxy", "- bimspect_network")
        text = text.replace("    name: bimspect_marketing_proxy\n    external: true", "    driver: bridge")
        with tempfile.TemporaryDirectory() as folder:
            file = Path(folder) / "bad.yml"
            file.write_text(text)
            config = resolve(file, "--env-file", os.devnull, env=self.env)
        self.assert_rejected(config, "publicly exposed")
        self.assert_rejected(config, "Local Docker network")
        self.assert_rejected(config, "missing or renamed")

    def test_wrong_external_network_name(self):
        c = self.altered()
        c["networks"]["marketing_proxy"]["name"] = "wrong_proxy"
        self.assert_rejected(c, "missing or renamed")

    def test_external_network_cannot_become_managed(self):
        c = self.altered()
        c["networks"]["marketing_proxy"]["external"] = False
        self.assert_rejected(c, "remain external")

    def test_missing_web_network(self):
        c = self.altered()
        c["services"]["web"].pop("networks")
        self.assert_rejected(c, "only be connected")

    def test_missing_alias(self):
        c = self.altered()
        c["services"]["web"]["networks"]["marketing_proxy"] = {}
        self.assert_rejected(c, "marketing-web alias")

    def test_local_networks_cannot_hide_beside_correct_proxy(self):
        for token in ("bimspect_local", "bimspect_network"):
            with self.subTest(token=token):
                c = self.altered()
                c["networks"][token] = {"name": token, "driver": "bridge"}
                self.assert_rejected(c, "Local Docker network")

    def test_public_ipv4_ipv6_and_missing_host_binding(self):
        for name in ("web", "nginx-test"):
            for ip in ("0.0.0.0", "::", "", None):
                with self.subTest(name=name, ip=ip):
                    c = self.altered()
                    c["services"][name]["ports"][0]["host_ip"] = ip
                    self.assert_rejected(c, "publicly exposed")

    def test_extra_public_port_is_rejected(self):
        c = self.altered()
        c["services"]["web"]["ports"].append({"target": 3000, "published": "3000", "host_ip": "0.0.0.0"})
        self.assert_rejected(c, "exactly one")
        self.assert_rejected(c, "publicly exposed")

    def test_host_network_mode_is_rejected(self):
        c = self.altered()
        c["services"]["web"]["network_mode"] = "host"
        self.assert_rejected(c, "network_mode")

    def test_wrong_internal_port_is_rejected(self):
        c = self.altered()
        c["services"]["web"]["environment"]["PORT"] = "3001"
        self.assert_rejected(c, "internally on port 3000")

    def test_optional_nginx_test_and_custom_loopback_ports(self):
        c = self.altered()
        c["services"].pop("nginx-test")
        c["services"]["web"]["ports"][0]["published"] = "3101"
        self.assertEqual(validator.validate(c), [])

    def test_local_is_separate_project_image_and_bridge(self):
        local = resolve(ROOT / "docker-compose.local.yml", "--env-file", os.devnull, env=self.env)
        self.assertEqual(local["name"], "bimspect_website_local")
        self.assertEqual(set(local["networks"]), {"bimspect_local"})
        self.assertEqual(local["networks"]["bimspect_local"]["driver"], "bridge")
        self.assertFalse(local["networks"]["bimspect_local"].get("external", False))
        self.assertEqual(local["services"]["web"]["image"], "bimspect-website:local")
        self.assertEqual(local["services"]["web"]["ports"][0]["published"], "3000")
        self.assertEqual(local["services"]["nginx-test"]["ports"][0]["host_ip"], "127.0.0.1")
        self.assertNotIn("bimspect_marketing_proxy", json.dumps(local))
        self.assert_rejected(local, "Production project")

    def test_invalid_json_does_not_echo_credentials(self):
        result = subprocess.run(
            ["python3", str(ROOT / "scripts/validate-production-compose.py")],
            input='{"credential":"sentinel-secret",', text=True, capture_output=True
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("sentinel-secret", result.stdout + result.stderr)

    def check_fixture(self, filename=None, text=None, env_extra=None):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            (root / "scripts").mkdir()
            for name in ("check-production-compose.sh", "validate-production-compose.py"):
                (root / "scripts" / name).write_text((ROOT / "scripts" / name).read_text())
            (root / "docker-compose.yml").write_text(text or (ROOT / "docker-compose.yml").read_text())
            if filename:
                (root / filename).write_text("services: {}\n")
            return subprocess.run(
                ["bash", str(root / "scripts/check-production-compose.sh")],
                cwd=root, env={**self.env, **(env_extra or {})}, text=True, capture_output=True
            )

    def test_automatic_overrides_and_competing_defaults_are_rejected(self):
        for filename in ("docker-compose.override.yml", "docker-compose.override.yaml",
                         "compose.override.yml", "compose.override.yaml", "compose.yaml",
                         "compose.yml", "docker-compose.yaml"):
            with self.subTest(filename=filename):
                result = self.check_fixture(filename=filename)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(filename, result.stderr)

    def test_invalid_compose_is_rejected_by_shell_checker(self):
        result = self.check_fixture(text="services: [invalid\n")
        self.assertNotEqual(result.returncode, 0)

    def test_explicit_production_file_ignores_compose_file_environment(self):
        result = self.check_fixture(env_extra={"COMPOSE_FILE": str(ROOT / "docker-compose.local.yml")})
        self.assertEqual(result.returncode, 0, result.stderr)

    def deploy_fixture(self, scenario):
        """Exercise a copy with a temporary path and fake CLI. Never contact a server."""
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            (root / "scripts").mkdir()
            (root / "bin").mkdir()
            (root / ".env").write_text("# No credentials in this test.\n")
            (root / "package.json").write_text('{"name":"bimspect-website"}')
            (root / "docker-compose.yml").write_text((ROOT / "docker-compose.yml").read_text())
            for name in ("check-production-compose.sh", "validate-production-compose.py", "deploy-production.sh"):
                source = (ROOT / "scripts" / name).read_text()
                if name == "deploy-production.sh":
                    source = source.replace("/opt/bimspect-website", str(root))
                file = root / "scripts" / name
                file.write_text(source)
                file.chmod(0o755)
            config = self.altered()
            config["services"]["web"]["ports"][0]["published"] = "3101"
            (root / "model.json").write_text(json.dumps(config))
            fake = '''#!/usr/bin/env python3
import json,os,sys
from pathlib import Path
root=Path(os.environ["MOCK_ROOT"]); scenario=os.environ["MOCK_SCENARIO"]
kind=Path(sys.argv[0]).name; args=sys.argv[1:]
with (root/"calls.jsonl").open("a") as out: out.write(json.dumps([kind,*args])+"\\n")
if kind=="git": print(root)
elif kind=="sleep": pass
elif kind=="curl":
    if scenario=="origin-failure" and args[-1].startswith("http:"): sys.exit(22)
    if scenario=="public-failure" and args[-1].startswith("https:"): sys.exit(22)
elif args[:2]==["context","show"]: print("default")
elif args[:2]==["context","inspect"]: print("unix:///var/run/docker.sock")
elif args[:2]==["network","inspect"]:
    if scenario=="missing-network": sys.exit(1)
elif args and args[0]=="inspect":
    print("running "+({"unhealthy":"unhealthy","health-timeout":"starting"}.get(scenario,"healthy")))
elif args and args[0]=="compose":
    if "version" in args: print("Docker Compose version test")
    elif "config" in args: print((root/"model.json").read_text())
    elif "build" in args:
        if scenario=="build-failure": sys.exit(1)
    elif "ps" in args and "-q" in args: print("website-test-container")
    elif "ps" in args or "logs" in args: print("website diagnostics")
'''
            for name in ("docker", "git", "curl", "sleep"):
                file = root / "bin" / name
                file.write_text(fake)
                file.chmod(0o755)
            env = {**self.env, "PATH": str(root / "bin") + os.pathsep + os.environ["PATH"],
                   "MOCK_ROOT": str(root), "MOCK_SCENARIO": scenario}
            for key in ("DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH"):
                env.pop(key, None)
            result = subprocess.run(["bash", str(root / "scripts/deploy-production.sh")], cwd=root,
                                    env=env, text=True, capture_output=True)
            calls = [json.loads(line) for line in (root / "calls.jsonl").read_text().splitlines()]
            return result, calls

    def test_deploy_build_failure_does_not_replace_running_service(self):
        result, calls = self.deploy_fixture("build-failure")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any("up" in call for call in calls))
        self.assertFalse(any(call[0] == "curl" for call in calls))

    def test_deploy_missing_network_fails_before_build(self):
        result, calls = self.deploy_fixture("missing-network")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("will NOT create", result.stderr)
        self.assertFalse(any("build" in call or "create" in call for call in calls))

    def test_deploy_post_replacement_failures_show_scoped_diagnostics(self):
        for scenario in ("unhealthy", "health-timeout", "origin-failure", "public-failure"):
            with self.subTest(scenario=scenario):
                result, calls = self.deploy_fixture(scenario)
                self.assertNotEqual(result.returncode, 0)
                self.assertTrue(any("logs" in call and call[-1] == "web" for call in calls))
                if scenario != "public-failure":
                    self.assertFalse(any(call[-1] == "https://bimspect.com/" for call in calls))

    def test_deploy_orders_build_health_actual_origin_port_then_public(self):
        result, calls = self.deploy_fixture("success")
        self.assertEqual(result.returncode, 0, result.stderr)
        build = next(i for i, call in enumerate(calls) if "build" in call)
        up = next(i for i, call in enumerate(calls) if "up" in call)
        health = next(i for i, call in enumerate(calls) if call[:2] == ["docker", "inspect"])
        probes = [(i, call[-1]) for i, call in enumerate(calls) if call[0] == "curl"]
        self.assertLess(build, up)
        self.assertLess(up, health)
        self.assertLess(health, probes[0][0])
        self.assertEqual([url for _, url in probes], ["http://127.0.0.1:3101/", "https://bimspect.com/"])
        self.assertEqual(calls[build][-2:], ["build", "web"])
        self.assertEqual(calls[up][-5:], ["up", "-d", "--no-deps", "--no-build", "web"])
        self.assertFalse(any("prune" in call or "down" in call or "create" in call for call in calls))

    def test_deploy_refuses_to_run_from_non_production_repository(self):
        result = subprocess.run(["bash", str(ROOT / "scripts/deploy-production.sh")], cwd=ROOT, text=True, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("/opt/bimspect-website only", result.stderr)

    def test_local_and_production_keep_same_runtime_contract(self):
        local = resolve(ROOT / "docker-compose.local.yml", "--env-file", os.devnull, env=self.env)
        # Intentional duplication: CI catches accidental runtime/security drift.
        for name in self.base["services"]:
            a, b = copy.deepcopy(self.base["services"][name]), copy.deepcopy(local["services"][name])
            for service in (a, b):
                for key in ("networks", "ports"):
                    service.pop(key, None)
            if name == "web":
                a.pop("image")
                b.pop("image")
            self.assertEqual(a, b)


if __name__ == "__main__":
    unittest.main(verbosity=2)
