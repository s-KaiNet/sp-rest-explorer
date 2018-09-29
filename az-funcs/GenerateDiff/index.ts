export = function run(context: any, timer: any): void {
  execute(context)
      .catch((err: any) => {
        context.log.error(err)
        context.done(err)
      })
}

async function execute(context: any): Promise<any> {
  context.log.info('Generating diff files')

  context.log.info('Finished generation')
  context.done()
}
