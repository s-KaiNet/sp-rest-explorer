import type { FunctionImport } from '@/lib/metadata'
import { TypeLink } from './TypeLink'

interface MethodsTableProps {
  functions: FunctionImport[]
}

/**
 * Methods table with Method | Parameters | Returns columns.
 * Method names in blue monospace. Parameters one-per-line.
 * Composable methods show COMPOSABLE badge.
 * `this` parameter filtered from display.
 * Always sorted alphabetically by method name.
 */
export function MethodsTable({ functions }: MethodsTableProps) {
  const sorted = [...functions].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: '25%' }}>
            Method
          </th>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: '48%' }}>
            Parameters
          </th>
          <th className="border-b border-border bg-background py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ width: '27%' }}>
            Returns
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((fn) => {
          // Filter out `this` parameter
          const visibleParams = fn.parameters.filter((p) => p.name !== 'this')

          return (
            <tr
              key={fn.id}
              className="transition-colors hover:bg-muted/50"
            >
              <td className="border-b border-border/50 py-2 align-top font-mono font-semibold text-type-fn whitespace-nowrap">
                {fn.name}
              </td>
              <td className="border-b border-border/50 py-2 align-top">
                {visibleParams.length === 0 ? (
                  <span className="text-xs italic text-muted-foreground">none</span>
                ) : (
                  <ul className="m-0 list-none space-y-0.5 p-0 font-mono text-xs">
                    {visibleParams.map((param) => (
                      <li key={param.name} className="leading-relaxed">
                        <span className="font-medium">{param.name}</span>
                        <span className="text-muted-foreground">: </span>
                        <TypeLink typeName={param.typeName} />
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="border-b border-border/50 py-2 align-top whitespace-nowrap text-xs">
                {!fn.returnType || fn.returnType === 'void' || fn.returnType === 'Edm.Void' ? (
                  <span className="italic text-muted-foreground">void</span>
                ) : (
                  <TypeLink typeName={fn.returnType} />
                )}
                {fn.isComposable && (
                  <span className="ml-1.5 inline-block rounded bg-type-fn/10 px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-type-fn">
                    COMPOSABLE
                  </span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
