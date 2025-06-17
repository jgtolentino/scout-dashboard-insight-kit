#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# 🔒 AGENT LOCK SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
# Generates hash locks for agents to ensure integrity
# ═══════════════════════════════════════════════════════════════════════════════

AGENT_NAME="${1:-}"

if [ -z "$AGENT_NAME" ]; then
    echo "Usage: $0 <agent_name>"
    echo "Example: $0 percy"
    exit 1
fi

echo "🔒 Locking agent: $AGENT_NAME"

# Check if agent exists
if [ "$AGENT_NAME" = "percy" ]; then
    AGENT_PATH="packages/agents/percy"
elif [ "$AGENT_NAME" = "keykey" ]; then
    AGENT_PATH="agents/keykey"
elif [ "$AGENT_NAME" = "claude" ]; then
    AGENT_PATH="agents/claude"
else
    echo "❌ Unknown agent: $AGENT_NAME"
    exit 1
fi

if [ ! -d "$AGENT_PATH" ]; then
    echo "❌ Agent directory not found: $AGENT_PATH"
    exit 1
fi

# Generate hash of agent files
AGENT_HASH=$(find "$AGENT_PATH" -type f \( -name "*.yaml" -o -name "*.ts" -o -name "*.js" \) -exec cat {} \; | sha256sum | cut -d' ' -f1)

echo "📝 Generated hash for $AGENT_NAME: sha256:$AGENT_HASH"

# Update .pulserrc with the hash
if grep -q "^  $AGENT_NAME:" .pulserrc; then
    # Update existing hash
    sed -i.bak "s/^  $AGENT_NAME: sha256:.*/  $AGENT_NAME: sha256:$AGENT_HASH/" .pulserrc
    echo "✅ Updated hash for $AGENT_NAME in .pulserrc"
else
    # Add new hash entry
    echo "  $AGENT_NAME: sha256:$AGENT_HASH" >> .pulserrc
    echo "✅ Added hash for $AGENT_NAME to .pulserrc"
fi

echo "🔒 Agent $AGENT_NAME locked successfully"
