(function determineNaturalSize(url) {
    const img = new Image();
    img.src = url
    return {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
    }
})("[@1]")
