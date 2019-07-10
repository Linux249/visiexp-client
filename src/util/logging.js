const logging = true // todo add false in production later

export const logYellow = (value) => logging && console.log('%c ' + value, 'background: grey; color: yellow; padding: 5px;')
