#!/bin/sh
# Husky

if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky: $*" >&2
  }

  readonly hook_name="$(basename "$0")"
  debug "starting $hook_name..."

  if [ -z "$HUSKY" ]; then
    echo "Can't find HUSKY, skipping $hook_name hook" >&2
    exit 0
  fi

  export PATH="$HUSKY/node_modules/.bin:$PATH"
  export HUSKY_SKIP_HOOKS=1
  sh -e "$HUSKY/run" "$hook_name" "$@"
  exit $?
fi
