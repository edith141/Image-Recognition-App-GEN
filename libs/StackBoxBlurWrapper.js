/* =====================================
 ** Blur Image Effect- by JavaScript Kit (www.javascriptkit.com)
 ** Visit JavaScript Kit at http://www.javascriptkit.com/ for full source code
 ** Requires: StackBoxBlur.js
 ** File last updated: Sept 15th, 2014
===================================== */

var stackBoxBlurIt = (function(){
	var fps = 30 // frames per second
	var cancanvas = !!document.createElement('canvas').getContext
	
	function stackBoxBlurIt(imgid, canvasid){
		var img = document.getElementById(imgid)
		if (!cancanvas){ // if browser doesn't support canvas element, just exit
			img.blurit = function(){return this}
			return img
		}
		img.style.display = 'none'
		this.imgid = imgid
		if (typeof canvasid == 'undefined'){
			var canvas = document.createElement('canvas')
			canvas.setAttribute('id', 'canvas_' + imgid)
			img.parentNode.insertBefore(canvas, img.nextSibling)
		}
		this.canvasid = 'canvas_' + imgid
		this.canvas = canvas
		this.curblur = 0
		this.timer = null
		blurengine.call(this, 0) // set canvas blur to 0 at start up in order for canvas to show up (otherwise blank)
		var stackobj = this
	
	
		function blurengine(num, duration){
			clearInterval(this.timer)
			if (typeof duration == 'undefined'){
				stackBoxBlurImage(this.imgid, this.canvasid, num)
				this.curblur = num
			}
			else{
				var stackobj = this
				var starttime = new Date().getTime()
				var startamt = this.curblur
				this.timer = setInterval(function(){ // set Interval
					var runtime = new Date().getTime() - starttime
					var progress = Math.min( (runtime / duration), 1).toFixed(2)
					stackobj.curblur = startamt + (progress * (num-startamt))
					stackBoxBlurImage(stackobj.imgid, stackobj.canvasid, stackobj.curblur)
					if (progress >= 1)
						clearInterval(stackobj.timer)
				}, 1000/fps)
				
			}
		}
	
		this.canvas.blurit = function(num, duration){
			blurengine.call(stackobj, num, duration)
			return this
		}

		return this.canvas
	}
	return stackBoxBlurIt
})()