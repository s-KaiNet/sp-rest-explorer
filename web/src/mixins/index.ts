export let docsMixin = {
  methods: {
    getPropertyName(typeName: string): string {
      if (typeName.indexOf('Edm.') !== -1) {
        return typeName.replace(/Edm\./gi, '')
      }

      return typeName
    }
  }
}
