## Tools

```bash
uv tool install "memsearch[ollama]"
```

## Optional web research in OpenCode

The project configures `parallel-search` in [opencode.json](opencode.json) with
`PARALLEL_API_KEY`. For contributor research without a Parallel account or API
key, [Parallel Search MCP](https://docs.parallel.ai/integrations/mcp/search-mcp)
also offers free web search in Fast mode and page fetching. Anonymous access has
lower rate limits and is intended for exploration and light use.

To opt in locally, add `parallel-search-free` inside the existing `mcp` object in
`opencode.json`, using this configuration. Keep the other server entries. The
separate name avoids inheriting the authenticated connection's headers when
OpenCode merges configuration files.

```json
{
  "mcp": {
    "parallel-search-free": {
      "type": "remote",
      "url": "https://search.parallel.ai/mcp",
      "enabled": true,
      "oauth": false,
      "headers": {
        "User-Agent": "sp-rest-explorer"
      }
    }
  }
}
```

For a keyless session, also set `"enabled": false` on the existing
`parallel-search` entry locally. Keep its URL and Authorization header so you can
re-enable it when using `PARALLEL_API_KEY`. These are optional local edits; no
change to the checked-in configuration is needed to keep using the authenticated
connection.

Restart OpenCode after saving. From the repository root, check that
`parallel-search-free` is connected:

```bash
opencode mcp list
```

Then try this prompt in OpenCode:

> Use parallel-search-free to find Microsoft Learn documentation for SharePoint
> REST $select and $expand. Fetch the most relevant page, summarize how to expand
> lookup fields, and include the source URLs.

Use `memsearch` as described in [AGENTS.md](AGENTS.md) for project context first;
web research supplements that knowledge with external reference material. This
setup is for contributor tooling and leaves the explorer's metadata search
unchanged. See [OpenCode's MCP guide](https://opencode.ai/docs/mcp-servers/) for
connection options.

## Skils

```bash
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices --agent opencode
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --agent opencode
npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns --agent opencode
npx skills add obra/superpowers --skill brainstorming --agent opencode
npx skills add wshobson/agents --skill typescript-advanced-types --agent opencode
npx skills add wshobson/agents --skill api-design-principles --agent opencode
npx skills add wshobson/agents --skill tailwind-design-system --agent opencode
npx skills add giuseppe-trisciuoglio/developer-kit --skill shadcn-ui --agent opencode
npx skills add anthropics/skills --skill skill-creator
```
