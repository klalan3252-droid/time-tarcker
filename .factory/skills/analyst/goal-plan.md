Plan the implementation of the approved spec for the writer, who works test-first (red, green, refactor).
- steps: in order, each with the files it touches (existing paths, or new ones in the right place).
- setup_command: the command that installs the project's dependencies, including test/dev
  ones, from the repository root in a fresh environment without root (e.g.
  `pip install -e '.[dev]'`, `npm ci`). Empty if nothing needs installing. The factory runs it
  before the tests in every sandbox, including the independent verifier's clean one.
- test_command: the exact command that runs the project's tests from the repository root. If
  there is no test setup, say which one to add and the command it will use. Run it on the
  untouched checkout (after setup_command) and record the baseline result in notes. If it
  already fails, make the first step fix the baseline, or flag the failure, so it is not
  discovered later in red.
- run: how to start the finished app for behavioural checks, if it is a server: the command
  (listening on 0.0.0.0), its port, and a path that answers 2xx once it is up (e.g. /healthz,
  or / for a web page). For a library or CLI, an empty command and port 0.
- notes: conventions or pitfalls the writer must respect, and the baseline test result.
