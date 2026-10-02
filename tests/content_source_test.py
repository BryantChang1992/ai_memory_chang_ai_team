"""Prevent migration syntax that Jekyll silently renders as broken prose."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TABLE_RULE = re.compile(r'^\s*\|?\s*:?-{3,}:?\s*\|(?:\s*:?-{3,}:?\s*\|?)+\s*$')


def prose_lines(text):
    """Ignore front matter and fenced examples without changing line numbers."""
    lines = text.splitlines()
    front_matter = bool(lines and lines[0] == '---')
    fence = None
    for index, line in enumerate(lines):
        if front_matter:
            if index and line == '---':
                front_matter = False
            yield ''
            continue
        marker = re.match(r'^\s*(`{3,}|~{3,})', line)
        if marker:
            value = marker[1]
            if fence is None:
                fence = value
            elif value[0] == fence[0] and len(value) >= len(fence):
                fence = None
            yield ''
            continue
        yield '' if fence else line


class ContentSourceTest(unittest.TestCase):
    def test_public_posts_have_no_unresolved_wikilinks(self):
        for path in sorted((ROOT / '_posts').glob('*.md')):
            for number, line in enumerate(prose_lines(path.read_text()), 1):
                self.assertNotRegex(line, r'\[\[[^\]]+\]\]', f'{path.name}:{number}')

    def test_pipe_tables_are_separated_from_prose(self):
        for path in sorted((ROOT / '_posts').glob('*.md')):
            lines = list(prose_lines(path.read_text()))
            for index, line in enumerate(lines):
                if index >= 2 and TABLE_RULE.fullmatch(line):
                    self.assertFalse(lines[index - 2].strip(),
                                     f'{path.name}:{index}: add a blank line before the table header')

    def test_examples_are_not_treated_as_article_markup(self):
        self.assertEqual(list(prose_lines('---\ntitle: Demo\n---\n```md\n[[example]]\n```\nText')), ['', '', '', '', '', '', 'Text'])


if __name__ == '__main__':
    unittest.main()
