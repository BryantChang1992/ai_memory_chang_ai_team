"""Publish legacy pages and their assets, without operational Markdown files."""
from pathlib import Path
import shutil
import sys

root = Path(__file__).resolve().parents[1]
destination = Path(sys.argv[1]).resolve()
public_extensions = {'.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.woff', '.woff2'}
count = 0
for directory in ('tech_research', 'tech_designs', 'blog'):
    for source in (root / directory).rglob('*'):
        if source.is_file() and source.suffix.lower() in public_extensions:
            target = destination / source.relative_to(root)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            count += 1
print(f'Copied {count} legacy pages and assets.')
