#!/usr/bin/env python3
"""Validate Compose's resolved JSON model, without needing a Docker daemon.

Never print the resolved model: it can contain interpolated server credentials.
"""

import argparse
import json
import sys


def validate(config):
    errors = []
    if config.get("name") != "bimspect_website":
        errors.append("Production project must be named bimspect_website.")
    networks = config.get("networks", {})
    proxy = networks.get("marketing_proxy", {})
    if proxy.get("name") != "bimspect_marketing_proxy":
        errors.append("Production network bimspect_marketing_proxy is missing or renamed.")
    if proxy.get("external") is not True:
        errors.append("Production marketing_proxy must remain external, not Compose-managed.")
    if set(networks) != {"marketing_proxy"}:
        errors.append("Unexpected/local Docker network detected in production configuration.")
    for name, network in networks.items():
        if any(token in name or token in network.get("name", "")
               for token in ("bimspect_local", "bimspect_network")):
            errors.append("Local Docker network detected in production configuration.")

    services = config.get("services", {})
    if "web" not in services:
        errors.append("Production web service is missing.")
    if set(services) - {"web", "nginx-test"}:
        errors.append("Unexpected services detected; this project is only the website and nginx-test.")
    for name, service in services.items():
        attached = service.get("networks", {})
        if set(attached) != {"marketing_proxy"}:
            errors.append(f"Production {name} service must only be connected to marketing_proxy.")
        if service.get("network_mode"):
            errors.append(f"Production {name} cannot bypass marketing_proxy with network_mode.")
    web = services.get("web", {})
    attached = web.get("networks", {}).get("marketing_proxy") or {}
    if "marketing-web" not in (attached.get("aliases") or []):
        errors.append("Production web service is missing the marketing-web alias.")
    if str(web.get("environment", {}).get("PORT")) != "3000":
        errors.append("Production Next.js must listen internally on port 3000.")

    def check_ports(name, target):
        ports = services.get(name, {}).get("ports", [])
        if len(ports) != 1:
            errors.append(f"Production {name} must have exactly one loopback-only port binding.")
        for port in ports:
            if port.get("host_ip") != "127.0.0.1":
                errors.append(
                    f"Production {name} port is publicly exposed. Bind only to 127.0.0.1."
                )
            if str(port.get("target")) != str(target) or port.get("protocol", "tcp") != "tcp":
                errors.append(f"Production {name} must publish internal TCP port {target}.")
            published = str(port.get("published", ""))
            if not published.isdecimal() or not 1 <= int(published) <= 65535:
                errors.append(f"Production {name} requires a single valid host port, not a range.")

    check_ports("web", 3000)
    if "nginx-test" in services:
        check_ports("nginx-test", 80)
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--origin-port", action="store_true", help="Print only the validated web host port")
    args = parser.parse_args()
    try:
        config = json.load(sys.stdin)
        errors = validate(config)
    except (ValueError, TypeError, AttributeError):
        print("ERROR: Invalid resolved production Compose JSON. Check docker compose config.", file=sys.stderr)
        return 1
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    if args.origin_port:
        print(config["services"]["web"]["ports"][0]["published"])
    else:
        print("PASS: production network, web alias and loopback-only ports are safe.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
