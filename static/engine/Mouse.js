export class Mouse {
	constructor(camera) {
		this.camera = camera

		this.currentMousePosition = {
			x: 0,
			y: 0,
		}


		this.down = false

		document.addEventListener('mousemove', (e) => {
			this.currentMousePosition = this.positionRelativeToCamera(e)
		})

		document.addEventListener('mousedown', e => {
			this.down = true
		})

		document.addEventListener('mouseup', e => {
			this.down = false
		})
	}

	positionRelativeToCamera(e) {
		// Apply inverse transformations for translation and zoom
		const inverseZoom = 1 / this.camera.zoom

		return {
			x:
				(e.clientX - this.camera.offset.x) * inverseZoom +
				this.camera.objectToFollow.x,
			y:
				(e.clientY - this.camera.offset.y) * inverseZoom +
				this.camera.objectToFollow.y,
		}
	}
}