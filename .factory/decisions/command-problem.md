# Retro: command problem

Retro: The task was lost to a broken test command (`node --test test/`) that no stage fixed. Green retried it unchanged and then escalated, and a person took over. A test command that errors on a missing module should be recognised as a command problem and changed, not retried. (2 episodes, 1 fact, 1 proposal for the Improver)
