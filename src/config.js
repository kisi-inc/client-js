let globalConfig = {
    axiosDefaultConfig: {
        baseURL: "https://api.getkisi.com/",
        timeout: 5000,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    },

    supportedEndpoints: ["places", "groups", "locks"]
}

export default globalConfig