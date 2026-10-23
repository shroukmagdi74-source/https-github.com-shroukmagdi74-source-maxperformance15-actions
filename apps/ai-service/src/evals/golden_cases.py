"""Golden cases validator and loader for MaxP platform applications (AGENT-COV-5b).

Validates the golden eval suite for all 27 applications against known capabilities,
catalog bridge constraints, and merchant approval policies without third-party imports.
Pure stdlib, zero network in CI.
"""
from __future__ import annotations

import ast
import json
import os
import re
from pathlib import Path
from typing import Any, Iterable


def load_cases(path: str | Path) -> dict[str, Any]:
    """Load the golden cases JSON file.

    Returns the root dict which contains 'version' and 'cases'.
    """
    file_path = Path(path).resolve()
    if not file_path.exists():
        raise FileNotFoundError(f"Golden cases file not found at {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict) or "cases" not in data:
        raise ValueError(f"Golden cases JSON must contain a root dictionary with a 'cases' list: {file_path}")

    return data


def _find_repo_root(start: str | Path | None = None) -> Path:
    if start is None:
        curr = Path(__file__).resolve()
    else:
        curr = Path(start).resolve()

    # If start is a file, start from its parent
    if curr.is_file():
        curr = curr.parent

    for _ in range(8):
        if (curr / "apps" / "ai-service" / "src" / "tools").exists():
            return curr
        if curr.parent == curr:
            break
        curr = curr.parent

    return Path(start or ".").resolve()


def known_capabilities(repo_root: str | Path | None = None) -> dict[str, dict[str, Any]]:
    """Extract known capabilities across the codebase using pure text and AST parsing.

    Sources parsed (strictly text/AST, side-effect free, no application imports):
      1. apps/ai-service/src/tools/role_tools.yaml (all roles)
      2. apps/ai-service/src/tools/catalog_seed.py (CURATED_CAPABILITIES name + app_slug)
      3. apps/ai-service/src/tools/registry.py (WRITE_TOOL_NAMES, DIRECT_WRITE_TOOL_NAMES, etc.)
      4. apps/ai-service/src/tools/definitions/*.py (FunctionTool name and definition names)

    Returns a mapping:
      capability_name -> {
          "apps": set[str],
          "write": bool,             # True if in WRITE_TOOL_NAMES (requires approval)
          "direct_write": bool,      # True if in DIRECT_WRITE_TOOL_NAMES (executes immediately)
          "catalog_app_slug": str | None,
          "sources": set[str],
      }
    """
    root = _find_repo_root(repo_root)
    known: dict[str, dict[str, Any]] = {}

    def _ensure(name: str) -> dict[str, Any]:
        canonical = str(name).strip().replace(".", "_")
        if canonical not in known:
            known[canonical] = {
                "apps": set(),
                "write": False,
                "direct_write": False,
                "catalog_app_slug": None,
                "sources": set(),
            }
        return known[canonical]

    ai_service_tools = root / "apps" / "ai-service" / "src" / "tools"

    # 1. registry.py
    reg_path = ai_service_tools / "registry.py"
    if reg_path.exists():
        with open(reg_path, "r", encoding="utf-8") as f:
            reg_code = f.read()

        m_write = re.search(r"WRITE_TOOL_NAMES:\s*set\[str\]\s*=\s*\{([^}]+)\}", reg_code)
        if m_write:
            for item in re.findall(r'["\']([^"\']+)["\']', m_write.group(1)):
                entry = _ensure(item)
                entry["write"] = True
                entry["sources"].add("registry.WRITE_TOOL_NAMES")

        m_dir = re.search(r"DIRECT_WRITE_TOOL_NAMES:\s*set\[str\]\s*=\s*\{([^}]+)\}", reg_code)
        if m_dir:
            for item in re.findall(r'["\']([^"\']+)["\']', m_dir.group(1)):
                entry = _ensure(item)
                entry["direct_write"] = True
                entry["sources"].add("registry.DIRECT_WRITE_TOOL_NAMES")

        for set_name in ("CORE_TOOL_NAMES", "ADVANCED_TOOL_NAMES", "GATED_CORE_TOOL_NAMES"):
            m_set = re.search(rf"{set_name}:\s*set\[str\]\s*=\s*\{{([^}}]+)\}}", reg_code)
            if m_set:
                for item in re.findall(r'["\']([^"\']+)["\']', m_set.group(1)):
                    entry = _ensure(item)
                    entry["sources"].add(f"registry.{set_name}")

    # 2. catalog_seed.py
    cat_path = ai_service_tools / "catalog_seed.py"
    if cat_path.exists():
        with open(cat_path, "r", encoding="utf-8") as f:
            cat_code = f.read()
        try:
            cat_tree = ast.parse(cat_code, filename="catalog_seed.py")
            for node in ast.walk(cat_tree):
                val = None
                target_name = None
                if isinstance(node, ast.Assign):
                    for t in node.targets:
                        if isinstance(t, ast.Name):
                            target_name = t.id
                    val = node.value
                elif isinstance(node, ast.AnnAssign):
                    if isinstance(node.target, ast.Name):
                        target_name = node.target.id
                    val = node.value

                if target_name == "CURATED_CAPABILITIES" and isinstance(val, ast.List):
                    for elt in val.elts:
                        if isinstance(elt, ast.Dict):
                            cap: dict[str, Any] = {}
                            for k, v in zip(elt.keys, elt.values):
                                if isinstance(k, ast.Constant) and isinstance(v, ast.Constant):
                                    cap[k.value] = v.value
                            name = cap.get("name")
                            if name:
                                entry = _ensure(name)
                                entry["sources"].add("catalog_seed")
                                app_slug = cap.get("app_slug")
                                if app_slug:
                                    entry["catalog_app_slug"] = app_slug
                                    entry["apps"].add(app_slug)
        except Exception:
            pass

    # 3. role_tools.yaml
    role_path = ai_service_tools / "role_tools.yaml"
    if role_path.exists():
        with open(role_path, "r", encoding="utf-8") as f:
            for line in f:
                stripped = line.strip()
                if stripped.startswith("- "):
                    tool_name = stripped[2:].strip().strip('"').strip("'")
                    if tool_name and not tool_name.startswith("#"):
                        entry = _ensure(tool_name)
                        entry["sources"].add("role_tools.yaml")

    # 4. definitions/*.py
    def_dir = ai_service_tools / "definitions"
    if def_dir.exists():
        for fpath in def_dir.glob("*.py"):
            if fpath.name.startswith("__"):
                continue
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            # Match FunctionTool(name="...") or FunctionTool("...")
            for m in re.finditer(r'FunctionTool\(\s*(?:name\s*=\s*)?["\']([^"\']+)["\']', content):
                entry = _ensure(m.group(1))
                entry["sources"].add(f"definitions/{fpath.name}")
            # Match top-level name="..." in tool descriptors
            for m in re.finditer(r'\bname\s*=\s*["\']([a-zA-Z0-9_]+)["\']', content):
                entry = _ensure(m.group(1))
                entry["sources"].add(f"definitions/{fpath.name}")

    return known


def validate(
    cases_data: dict[str, Any] | list[dict[str, Any]],
    known: dict[str, dict[str, Any]],
    app_slugs: Iterable[str],
) -> list[str]:
    """Validate golden cases against platform rules and integrity constraints.

    Rules enforced:
      1. Case structure: unique 'id', known 'app', non-empty 'question' (>=8 chars), non-empty 'expected_capabilities'.
      2. Capability existence: every expected capability exists in 'known'.
      3. Bridge app consistency: if a capability comes from catalog_seed with app_slug set, it must match the case's app.
      4. Approval gating: expect_approval MUST be True if any expected capability is in WRITE_TOOL_NAMES,
         and False otherwise.
      5. Forbidden capabilities: all items in forbidden_capabilities must be known capability names.

    Returns:
      A list of error description strings. An empty list signifies complete validity.
    """
    errors: list[str] = []

    if isinstance(cases_data, dict):
        cases = cases_data.get("cases", [])
    elif isinstance(cases_data, list):
        cases = cases_data
    else:
        return ["Invalid cases input: must be a dict with 'cases' list or a list of case dicts"]

    if not isinstance(cases, list):
        return ["'cases' field must be a list"]

    valid_app_slugs = set(app_slugs)
    seen_ids: set[str] = set()

    for idx, case in enumerate(cases):
        prefix = f"Case #{idx + 1}"
        if not isinstance(case, dict):
            errors.append(f"{prefix}: case entry is not a dictionary")
            continue

        cid = case.get("id")
        if not cid or not isinstance(cid, str):
            errors.append(f"{prefix}: missing or non-string 'id'")
            cid = f"unnamed-#{idx + 1}"
        else:
            cid = cid.strip()
            if cid in seen_ids:
                errors.append(f"Case '{cid}': duplicate case id")
            seen_ids.add(cid)

        # 1. app validation
        app = case.get("app")
        if not app or not isinstance(app, str):
            errors.append(f"Case '{cid}': missing or non-string 'app'")
        elif app not in valid_app_slugs:
            errors.append(f"Case '{cid}': unknown app slug '{app}' (not in APP_CARDS)")

        # 1. question validation
        question = case.get("question")
        if not question or not isinstance(question, str):
            errors.append(f"Case '{cid}': missing or non-string 'question'")
        elif len(question.strip()) < 8:
            errors.append(f"Case '{cid}': question is too short ({len(question.strip())} chars; must be >= 8 chars)")

        # 1. expected_capabilities validation
        expected_caps = case.get("expected_capabilities")
        if not expected_caps or not isinstance(expected_caps, list):
            errors.append(f"Case '{cid}': 'expected_capabilities' must be a non-empty list")
            expected_caps = []

        # 2 & 3. Capability existence and catalog app_slug match
        has_write_capability = False
        write_cap_names: list[str] = []

        for cap in expected_caps:
            canonical_cap = str(cap).strip().replace(".", "_")
            if canonical_cap not in known:
                errors.append(f"Case '{cid}': expected capability '{cap}' is not a known capability in the codebase")
                continue

            cap_info = known[canonical_cap]
            if cap_info.get("write"):
                has_write_capability = True
                write_cap_names.append(canonical_cap)

            # Rule 3: Bridge catalog matching
            cat_slug = cap_info.get("catalog_app_slug")
            if cat_slug and app and cat_slug != app:
                errors.append(
                    f"Case '{cid}': capability '{canonical_cap}' is bound to app '{cat_slug}' in catalog_seed, "
                    f"but case specifies app '{app}'"
                )

        # 4. expect_approval gate check
        expect_approval = case.get("expect_approval")
        if not isinstance(expect_approval, bool):
            errors.append(f"Case '{cid}': 'expect_approval' must be a boolean (True/False)")
        else:
            if has_write_capability and not expect_approval:
                errors.append(
                    f"Case '{cid}': expects write capability {write_cap_names} (in WRITE_TOOL_NAMES) "
                    f"but 'expect_approval' is False"
                )
            elif not has_write_capability and expect_approval:
                errors.append(
                    f"Case '{cid}': 'expect_approval' is True but none of expected_capabilities "
                    f"{expected_caps} are in WRITE_TOOL_NAMES"
                )

        # 5. forbidden_capabilities validation
        forbidden_caps = case.get("forbidden_capabilities", [])
        if forbidden_caps is None:
            forbidden_caps = []
        if not isinstance(forbidden_caps, list):
            errors.append(f"Case '{cid}': 'forbidden_capabilities' must be a list")
        else:
            for fcap in forbidden_caps:
                canonical_fcap = str(fcap).strip().replace(".", "_")
                if canonical_fcap not in known:
                    errors.append(
                        f"Case '{cid}': forbidden capability '{fcap}' is not a known capability in the codebase"
                    )

    return errors


def run_live(
    base_url: str,
    token: str,
    cases: list[dict[str, Any]] | None = None,
    limit: int | None = None,
) -> dict[str, Any]:
    """Execute golden eval cases against a live MaxP AI service instance.

    DOCUMENTED RUNNER ONLY. Intended for manual invocation with a valid session token;
    NEVER executed in automated CI or fast unit test suites.

    Args:
        base_url: Base endpoint URL of the AI service (e.g. 'https://maxp.online' or 'http://localhost:8000').
        token: Valid merchant / platform bearer token.
        cases: Optional filtered subset of cases. Defaults to loading app_cases.json.
        limit: Max number of cases to execute.

    Returns:
        Summary dictionary with execution results, accuracy metrics, and response logs.
    """
    import urllib.error
    import urllib.request

    if not token or not str(token).strip():
        raise ValueError("A valid authentication token is required for live eval execution.")

    if cases is None:
        default_path = Path(__file__).resolve().parents[2] / "evals" / "golden" / "app_cases.json"
        data = load_cases(default_path)
        cases = data.get("cases", [])

    if limit is not None and limit > 0:
        cases = cases[:limit]

    results: list[dict[str, Any]] = []
    endpoint = f"{base_url.rstrip('/')}/api/v1/agent/chat"

    for c in cases:
        case_id = c.get("id")
        question = c.get("question")
        expected_caps = c.get("expected_capabilities", [])
        expect_approval = c.get("expect_approval", False)

        payload = json.dumps({"message": question}).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        case_res: dict[str, Any] = {
            "id": case_id,
            "question": question,
            "success": False,
            "invoked_tools": [],
            "error": None,
        }

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                tool_calls = body.get("toolCalls", [])
                invoked = [t.get("name") for t in tool_calls if isinstance(t, dict)]
                case_res["invoked_tools"] = invoked

                matched = any(exp in invoked for exp in expected_caps)
                case_res["success"] = matched
        except Exception as exc:
            case_res["error"] = str(exc)

        results.append(case_res)

    passed = sum(1 for r in results if r["success"])
    return {
        "total": len(results),
        "passed": passed,
        "pass_rate": (passed / len(results)) if results else 0.0,
        "results": results,
    }
