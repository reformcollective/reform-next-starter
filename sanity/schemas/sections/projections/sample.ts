export const sampleProjection = `_type == "sample" => {
	"sampleVideo": reform::video(sampleVideo),
	"sampleImage": reform::image(sampleImage),
	"sampleLink": reform::link(sampleLink)
}` as const
