"""Shared test helpers for cluster-targeted tests."""

import json
import os
import subprocess

NAMESPACE = "triforce"
KUBECONFIG = os.environ.get("KUBECONFIG", os.path.expanduser("~/.kube/config-oberon"))


def oc(*args, namespace=None):
    """Run an oc command and return the CompletedProcess."""
    cmd = ["oc", "--kubeconfig", KUBECONFIG] + list(args)
    if namespace:
        cmd += ["-n", namespace]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=180)


def oc_json(*args, namespace=None):
    """Run an oc command with -o json and return parsed dict."""
    result = oc(*args, "-o", "json", namespace=namespace)
    if result.returncode != 0:
        return None
    return json.loads(result.stdout)


def curl_service(service, port, path, namespace=NAMESPACE, method="GET",
                 data=None, timeout=60, auth=None):
    """curl a ClusterIP service via oc exec from orchestrator pod."""
    url = f"http://{service}.{namespace}.svc:{port}{path}"
    cmd = ["curl", "-s", "-m", str(timeout), url]
    if auth:
        cmd += ["-H", f"Authorization: Bearer {auth}"]
    if method == "POST" and data:
        cmd += ["-X", "POST", "-H", "Content-Type: application/json",
                "-d", json.dumps(data)]
    result = oc("exec", "-n", namespace, "deploy/orchestrator", "--", *cmd)
    if result.returncode != 0:
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return result.stdout
