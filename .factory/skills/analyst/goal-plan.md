Plan the implementation of the approved spec for the writer, who works test-first (red, green, refactor).
- steps: in order, each with the files it touches (existing paths, or new ones in the right place).
- setup_command: the command that installs the project's dependencies, including test/dev
  ones, from the repository root in a fresh environment without root (e.g.
  `pip install -e '.[dev]'`, `npm ci`). Empty if nothing needs installing. The factory runs it
  before the tests in every sandbox, including the independent verifier's clean one.
- test_command: the exact command that runs the project's tests from the repository root. If
  there is no test setup, say which one to add and the command it will use. Choose a form that
  works on every version of the tool, not one that depends on how a particular version treats
  its arguments (for Node, `node --test` with no directory argument or an explicit file glob,
  not `node --test <dir>/`, which fails on some Node versions). Say in the plan that red must
  run this exact command and confirm that the tests are discovered.
- run: how to start the finished app for behavioural checks, if it is a server: the command
  (listening on 0.0.0.0), its port, and a path that answers 2xx once it is up (e.g. /healthz,
  or / for a web page). For a library or CLI, an empty command and port 0.
- notes: conventions or pitfalls the writer must respect.
