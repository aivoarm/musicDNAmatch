import os
import sys
import json
from pathlib import Path

# ─── Configuration ────────────────────────────────────────────────────────────

# ANY directory matching these names will be skipped entirely (at any depth)
EXCLUDE_DIR_NAMES = {
    # Python environments — the main culprit
    '.venv', 'venv', 'env', '.env', 'virtualenv',
    # JS dependencies
    'node_modules', '.next', '.turbo', '.vercel', 'out', 'dist', 'build',
    # Version control / IDE
    '.git', '.svn', '.vscode', '.idea',
    # Caches
    '__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache', 'coverage',
    # Misc
    'tmp', 'temp', 'logs',
    # Static / generated assets — not useful for debugging logic
    'public', '.svelte-kit',
}

# Any path SEGMENT starting with a dot is skipped (catches .venv, .next, etc.)
SKIP_DOT_DIRS = True

EXCLUDE_FILES = {
    '.env', '.env.local', '.env.production', '.env.development',
    '.env.test', '.gitignore', 'package-lock.json', 'yarn.lock',
    'pnpm-lock.yaml', 'Thumbs.db', '.DS_Store', 'extract.py',
    '.eslintrc.json', '.eslintrc.js', '.prettierrc',
}

# Config files — shown as structure only (deps list only for package.json)
STRUCTURE_ONLY_FILES = {
    'package.json', 'tsconfig.json', 'next.config.ts', 'next.config.js',
    'tailwind.config.ts', 'tailwind.config.js', 'postcss.config.mjs',
    'next.config.mjs',
}

# Only extract content from these extensions
CODE_EXTENSIONS = {
    '.ts', '.tsx', '.js', '.jsx',  # source (top priority)
    '.sql',                         # DB migrations
    '.css', '.scss',                # styles
    '.json',                        # config
    '.py',                          # python scripts (app-level only)
    '.md',                          # docs
    '.yaml', '.yml', '.toml',       # config
    '.sh',                          # shell
}

# Directories whose files are shown FIRST and in full
PRIORITY_DIR_SEGMENTS = {
    'lib', 'api', 'hooks', 'utils', 'types', 'components',
    'migrations',  # supabase migrations
}

# App page/route directories to include (relative to project root)
# Files outside these and priority dirs are shown but content may be trimmed
APP_CONTENT_DIRS = {
    'app', 'pages', 'src',
}

MAX_FILE_CHARS = 15_000   # per file
MAX_TOTAL_CHARS = 500_000  # whole output


# ─── Helpers ──────────────────────────────────────────────────────────────────

def should_skip_dir(dirname: str) -> bool:
    """Return True if this directory should be skipped entirely."""
    if dirname in EXCLUDE_DIR_NAMES:
        return True
    if SKIP_DOT_DIRS and dirname.startswith('.'):
        return True
    return False


def is_priority(rel_path: str) -> bool:
    parts = set(Path(rel_path).parts)
    return bool(parts & PRIORITY_DIR_SEGMENTS)


def is_app_file(rel_path: str) -> bool:
    top = Path(rel_path).parts[0] if Path(rel_path).parts else ''
    return top in APP_CONTENT_DIRS or is_priority(rel_path)


def file_score(rel_path: str, filename: str) -> int:
    """Lower = higher priority = shown first."""
    score = 200
    if is_priority(rel_path):
        score -= 100
    if 'api' in Path(rel_path).parts:
        score -= 40
    if 'lib' in Path(rel_path).parts:
        score -= 30
    if 'migrations' in Path(rel_path).parts:
        score -= 20
    if filename in ('route.ts', 'route.tsx'):
        score -= 15
    if filename in ('page.tsx', 'page.ts', 'layout.tsx'):
        score -= 10
    if filename.endswith('.sql'):
        score -= 10
    return score


# ─── Core ─────────────────────────────────────────────────────────────────────

def extract(startpath: str, output_file: str):
    startpath = os.path.abspath(startpath)
    project_name = os.path.basename(startpath)

    lines = []
    total_chars = [0]
    truncated = [False]

    def emit(text: str = ''):
        if truncated[0]:
            return
        s = text + '\n'
        total_chars[0] += len(s)
        if total_chars[0] > MAX_TOTAL_CHARS:
            lines.append('\n\n⚠️  [OUTPUT TRUNCATED — MAX_TOTAL_CHARS reached]\n')
            truncated[0] = True
            return
        lines.append(s)

    # ── Collect files ──────────────────────────────────────────────────────
    all_files: list[tuple[str, str, str]] = []  # (rel_path, abs_path, filename)

    for root, dirs, files in os.walk(startpath, topdown=True):
        # Prune dirs IN PLACE — this prevents os.walk from descending
        dirs[:] = sorted([
            d for d in dirs
            if not should_skip_dir(d)
        ])

        for filename in sorted(files):
            if filename in EXCLUDE_FILES:
                continue
            abs_path = os.path.join(root, filename)
            rel_path = os.path.relpath(abs_path, startpath)

            # Skip anything still inside a dot-dir we may have missed
            parts = Path(rel_path).parts
            if any(p.startswith('.') for p in parts[:-1]):
                continue

            all_files.append((rel_path, abs_path, filename))

    # Sort: priority first, then alphabetical
    all_files.sort(key=lambda x: (file_score(x[0], x[2]), x[0]))

    # ── Header ────────────────────────────────────────────────────────────
    emit(f'# musicDNAmatch — Code Extraction')
    emit(f'# Project : {project_name}')
    emit(f'# Root    : {startpath}')
    emit(f'# Files   : {len(all_files)}')
    emit(f'# {"="*58}')
    emit()
    emit('# PRIORITY dirs (shown first, full content):')
    emit('#   ' + ', '.join(sorted(PRIORITY_DIR_SEGMENTS)))
    emit(f'# Max chars/file : {MAX_FILE_CHARS:,}')
    emit(f'# Max total chars: {MAX_TOTAL_CHARS:,}')
    emit()

    # ── Directory tree ────────────────────────────────────────────────────
    emit('## DIRECTORY TREE')
    emit('```')
    seen_dirs: set[str] = set()
    for rel_path, _, filename in all_files:
        parts = Path(rel_path).parts
        for depth in range(1, len(parts)):
            dir_key = str(Path(*parts[:depth]))
            if dir_key not in seen_dirs:
                indent = '  ' * (depth - 1)
                emit(f'{indent}📁 {parts[depth-1]}/')
                seen_dirs.add(dir_key)
        indent = '  ' * (len(parts) - 1)
        star = '⭐' if is_priority(rel_path) else '  '
        emit(f'{indent}{star} {filename}')
    emit('```')
    emit()

    # ── File contents ─────────────────────────────────────────────────────
    emit('## FILE CONTENTS')
    emit()

    for rel_path, abs_path, filename in all_files:
        if truncated[0]:
            break

        ext = Path(filename).suffix.lower()
        is_code = ext in CODE_EXTENSIONS

        emit('─' * 62)
        prio = ' ⭐ PRIORITY' if is_priority(rel_path) else ''
        emit(f'### {rel_path}{prio}')

        if not is_code:
            emit(f'[skipped — extension {ext!r} not in CODE_EXTENSIONS]')
            emit()
            continue

        if filename in STRUCTURE_ONLY_FILES:
            emit(f'[STRUCTURE ONLY]')
            if filename == 'package.json':
                try:
                    with open(abs_path, encoding='utf-8') as f:
                        pkg = json.load(f)
                    scripts = pkg.get('scripts', {})
                    all_deps = {**pkg.get('dependencies', {}), **pkg.get('devDependencies', {})}
                    emit('# scripts: ' + ', '.join(f'{k}={v}' for k, v in scripts.items()))
                    emit('# dependencies:')
                    for k, v in sorted(all_deps.items()):
                        emit(f'#   {k}: {v}')
                except Exception as e:
                    emit(f'# [could not parse: {e}]')
            elif filename == 'tsconfig.json':
                try:
                    with open(abs_path, encoding='utf-8') as f:
                        tc = json.load(f)
                    co = tc.get('compilerOptions', {})
                    emit(f'# paths: {co.get("paths", "none")}')
                    emit(f'# baseUrl: {co.get("baseUrl", "none")}')
                    emit(f'# strict: {co.get("strict", False)}')
                except Exception:
                    pass
            emit()
            continue

        # Read file
        try:
            with open(abs_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            emit('[ERROR: binary/non-UTF-8 — skipped]')
            emit()
            continue
        except Exception as e:
            emit(f'[ERROR: {e}]')
            emit()
            continue

        lines_count = content.count('\n') + 1
        char_count = len(content)
        emit(f'# {lines_count} lines | {char_count:,} chars')

        if char_count <= MAX_FILE_CHARS:
            emit('```')
            emit(content)
            emit('```')
        else:
            head = int(MAX_FILE_CHARS * 0.65)
            tail = int(MAX_FILE_CHARS * 0.25)
            omitted = char_count - head - tail
            emit(f'# ⚠️  TRUNCATED (file too large) — showing first {head:,} + last {tail:,} chars')
            emit('```')
            emit(content[:head])
            emit(f'\n... ✂️  {omitted:,} chars omitted ...\n')
            emit(content[-tail:])
            emit('```')

        emit()

    # ── Summary ───────────────────────────────────────────────────────────
    emit()
    emit('## SUMMARY')
    emit(f'# Total files   : {len(all_files)}')
    emit(f'# Output chars  : {total_chars[0]:,}')
    emit(f'# Truncated     : {truncated[0]}')

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(''.join(lines))

    size_kb = os.path.getsize(output_file) / 1024
    print(f'✅  Done → {output_file}  ({size_kb:.0f} KB)')
    print(f'   Files: {len(all_files)} | Output: {total_chars[0]:,} chars | Truncated: {truncated[0]}')


# ─── Entry ────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python extract.py <project_dir> [output_file]')
        print('       output_file defaults to code_structure.txt')
        sys.exit(1)

    project_dir = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'code_structure.txt'

    if not os.path.isdir(project_dir):
        print(f'Error: {project_dir!r} is not a directory.')
        sys.exit(1)

    extract(project_dir, output_file)