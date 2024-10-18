exports.validImageURL = (url) => {
    if (!(typeof url === 'string')) return false
    const validExtensions = ['jpg', 'gif', 'jpeg', 'png', 'webp']
    var extentionSearch = url.match(/\.([^.]+)$/)
    const extention = (extentionSearch) ? extentionSearch[1] : 'No extension'
    return validExtensions.includes(extention.toLowerCase())
}