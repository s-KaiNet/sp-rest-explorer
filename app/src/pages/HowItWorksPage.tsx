import { Link } from 'react-router'
import { AlertCircle, Github } from 'lucide-react'

const stats = [
  { value: '2,449', label: 'Entity Types' },
  { value: '11,967', label: 'Properties' },
  { value: '3,528', label: 'Functions' },
  { value: '793', label: 'Root Endpoints' },
]

const archNodes = [
  {
    icon: 'SP',
    label: 'SharePoint Online',
    sublabel: 'Targeted release',
    gradient: 'from-teal-600 to-blue-600',
  },
  {
    icon: 'fn',
    label: 'Azure Function',
    sublabel: 'Daily timer trigger',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: 'B',
    label: 'Azure Blob Storage',
    sublabel: 'Public CDN',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    icon: 'E',
    label: 'Explorer App',
    sublabel: 'This website',
    gradient: 'from-green-600 to-green-500',
  },
]

const archArrows = [
  '_api/$metadata',
  'JSON + diff',
  'fetch on load',
]

const pipelineSteps = [
  'An Azure Function runs daily, fetching the latest $metadata from SharePoint Online.',
  'The function parses the XML metadata into a structured JSON object and generates a monthly diff.',
  'Both the full metadata JSON and monthly diff files are stored in Azure Blob Storage.',
  'This explorer app fetches the JSON on page load and renders it as a browsable interface.',
]

export function HowItWorksPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[720px] px-6 py-10">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-foreground mb-2">How it works</h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            Understanding the data behind the SharePoint REST API Metadata Explorer
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mb-9">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-xl border border-border bg-background p-4 text-center"
            >
              <div className="text-2xl font-bold text-foreground leading-none mb-1">{s.value}</div>
              <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* What is this? */}
        <section className="mb-9">
          <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
            What is this?
          </h2>
          <p className="text-sm text-muted-foreground leading-[1.7] mb-3">
            SharePoint exposes a REST API whose structure is described in a special metadata file. You
            can fetch it from any SharePoint site by making a{' '}
            <code className="rounded bg-code-bg px-1.5 py-0.5 text-[13px] font-mono text-foreground">GET</code>{' '}
            request to{' '}
            <code className="rounded bg-code-bg px-1.5 py-0.5 text-[13px] font-mono text-foreground">
              https://your-site/_api/$metadata
            </code>
            .
          </p>
          <p className="text-sm text-muted-foreground leading-[1.7]">
            This metadata describes all endpoints, methods, types, parameters, associations,
            annotations, and properties available in the SharePoint REST API. However, the raw XML is
            large (~1.5 MB) and difficult to navigate. This explorer parses that metadata into a
            searchable, browsable interface.
          </p>
        </section>

        {/* What you should know */}
        <section className="mb-9">
          <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
            What you should know
          </h2>
          <div className="rounded-lg border border-amber-300 dark:border-amber-700 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 my-4">
            <p className="text-[13px] text-amber-900 dark:text-amber-200 leading-[1.7]">
              <strong className="text-amber-800 dark:text-amber-300">Note:</strong>{' '}
              <code className="rounded bg-amber-100/80 dark:bg-amber-900/30 px-1.5 py-0.5 text-[13px] font-mono text-amber-900 dark:text-amber-200">
                $metadata
              </code>{' '}
              describes the <em>structure</em> of the REST API — it does not provide examples, HTTP
              methods, or usage guidance. For detailed documentation, refer to the{' '}
              <a
                href="https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                official SharePoint REST service docs
              </a>
              .
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-[1.7] mb-3">
            This explorer uses metadata from a SharePoint Online tenant with{' '}
            <strong className="text-foreground">Targeted release</strong> (formerly First Release).
            This means you always see the latest available snapshot of the API. Some endpoints shown
            here may be in preview and not yet available in your tenant.
          </p>
          <p className="text-sm text-muted-foreground leading-[1.7]">
            Where available, this explorer links directly to official Microsoft documentation for
            specific entities and endpoints.
          </p>
        </section>

        {/* Architecture */}
        <section className="mb-9">
          <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
            Architecture
          </h2>
          <p className="text-sm text-muted-foreground leading-[1.7] mb-5">
            The metadata is extracted and processed automatically through a pipeline:
          </p>

          {/* Architecture diagram */}
          <div className="rounded-xl border border-border bg-card p-8 mb-5">
            <div className="flex items-center justify-center">
              {archNodes.map((node, i) => (
                <div key={node.label} className="contents">
                  {/* Node */}
                  <div className="flex flex-col items-center gap-2 px-4 min-w-[120px]">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${node.gradient} text-2xl font-bold text-white`}
                    >
                      {node.icon}
                    </div>
                    <div className="text-xs font-semibold text-foreground text-center leading-tight">
                      {node.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground text-center">
                      {node.sublabel}
                    </div>
                  </div>

                  {/* Arrow (between nodes) */}
                  {i < archArrows.length && (
                    <div className="flex flex-col items-center gap-1 px-2 min-w-[80px]">
                      <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                        {archArrows[i]}
                      </span>
                      <div className="relative h-0.5 w-full bg-border">
                        <div className="absolute -right-px -top-[4px] border-l-[6px] border-l-border border-y-[5px] border-y-transparent" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline steps */}
          <div className="space-y-1.5">
            {pipelineSteps.map((step, i) => (
              <p key={i} className="text-[13px] text-muted-foreground leading-[1.7]">
                <strong className="text-foreground/80">{i + 1}.</strong> {step}
              </p>
            ))}
          </div>
        </section>

        {/* Monthly change tracking */}
        <section className="mb-9">
          <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
            Monthly change tracking
          </h2>
          <p className="text-sm text-muted-foreground leading-[1.7]">
            In addition to the full metadata snapshot, the Azure Function compares each month's
            metadata against the previous month and generates a structured diff. This powers the{' '}
            <Link
              to="/api-diff"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              API Changelog
            </Link>{' '}
            page, which shows entities and endpoints that were added, updated, or removed each month
            over the last 6 months.
          </p>
        </section>

        {/* Feedback & contributions */}
        <section className="mb-9">
          <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
            Feedback &amp; contributions
          </h2>
          <p className="text-sm text-muted-foreground leading-[1.7] mb-3">
            Found a bug, have a suggestion, or want to contribute? This project is open source.
          </p>
          <div className="flex gap-3 mt-3">
            <a
              href="https://github.com/s-KaiNet/sp-rest-explorer/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm"
            >
              <AlertCircle className="h-[18px] w-[18px]" />
              Report an issue
            </a>
            <a
              href="https://github.com/s-KaiNet/sp-rest-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm"
            >
              <Github className="h-[18px] w-[18px]" />
              View on GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
