import { AppInsights } from 'applicationinsights-js'

export class Logger {
  public static Error(err: any): void {
    console.log(err)

    if (process.env.NODE_ENV === 'production') {
      AppInsights.trackException(err)
    }
  }
}
