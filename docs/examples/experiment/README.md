# Optional fixture replay

This developer-only checker is not part of the installed skills. The core library does not require Python. If Python 3 is already available, run `python docs/examples/experiment/check.py` from any directory. Do not use `-O`, which disables assertions.

The original evaluator checker statements and hand-checked cases were retained. For distribution, the fixed source path was replaced with a path relative to this file and the hard-coded /tmp directory was removed. Markdown generation was omitted and output printing added. The adapted checker was rerun against the bundled synthetic fixture.

A zero exit means this known-failure fixture matches its expected results, not that the experiment passes its policy. This is not a general audit implementation. No packages are installed or source/data edited. Results are written to a new system temporary directory.
