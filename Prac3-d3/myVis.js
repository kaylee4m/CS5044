
height = 600
width = 1000

margin = ({top: 20, right: 60, bottom: 30, left: 60})

d3.csv("./dataset/data2008-2017.csv")
  .then(function(data){
	  
	  var sliderB = new Slider("#yearSlider", { 
		  min: 2008, 
		  max: 2017, 
		  value: [2010, 2015], 
		  focus: true ,
		  tooltip: 'always',
	  });
	  
	  sliderB.on("slideStop", function(slideEvt) {
		  
		 let domain = sliderB.getValue();
		 x.domain(domain)
		 
		 d3.selectAll('.lines').select("path")
			.transition()
		 	.attr("d", line);
		 	
		 d3.selectAll('.lines').selectAll('circle')
		 	.attr('cx', d => x(d.date))
		 	
		 d3.selectAll('.lines').selectAll('.tick')
		 	.attr('x', d => x(d.date) - 10)
		
		
	  });
	  
	  
    let dataGroup = {}
	
	let subjects = {}
	
	let countries = {}
	
	data.forEach(function(d){
		
		subjects[d.SUBJECT] = 1
		
		countries[d.LOCATION] = 1
		
		d.date = parseFloat(d.TIME)
		
		d.VALUE = parseFloat(d.VALUE)
		
		if(dataGroup[d.LOCATION] != undefined){
			
			if(dataGroup[d.LOCATION][d.SUBJECT] != undefined){
				
				let meta = {'date': d.date, 'value':+d.VALUE}
				dataGroup[d.LOCATION][d.SUBJECT].push(meta)
			}
			else{
				
				dataGroup[d.LOCATION][d.SUBJECT] = []
				let meta = {'date': d.date, 'value':+d.VALUE}
				dataGroup[d.LOCATION][d.SUBJECT].push(meta)
			}
			
		}
		else{
			
			dataGroup[d.LOCATION] = {}
			dataGroup[d.LOCATION][d.SUBJECT] = []
			let meta = {'date': d.date, 'value':+d.VALUE}
			dataGroup[d.LOCATION][d.SUBJECT].push(meta)
		}
		
	})
	
	var subjectSelector = document.getElementById("subject_selector");
	
	for (let subject in subjects){
		
		var option = document.createElement('option');
        option.text = option.value = subject;
        subjectSelector.add(option, 0);
		
	}
	
	var countriesSelector = document.getElementById("countries_selector");
	
	for (let country in countries){
		
		var option = document.createElement('option');
		option.text = option.value = country;
		option.selected = ""
		countriesSelector.add(option, 0);
		
	
	}
	
	$('#subject_selector').multiselect({
		
		onChange: function(option, checked) {
			
			if(checked){
		
				subject = option[0].text
				d3.selectAll('.lines').selectAll('path').attr('stroke', function(d){
					
					var gs = d3.select(this).attr('subject')
					
					if (gs == subject) return 'steelblue'
					else return 'none'
				})
				
				d3.selectAll('.lines').selectAll('circle')
				.attr("opacity", 0)
				
				d3.selectAll('.lines').selectAll('text')
				.attr("fill-opacity", 0)
				
				d3.selectAll('.lines').selectAll('rect')
				.attr("fill-opacity", 0)
				
				var elements = document.getElementById("countries_selector").options;
						
				for(var i = 0; i < elements.length; i++){
				  elements[i].selected = '';
				}
				
				$('option', $('#countries_selector')).each(function(element) {
					$(this).removeAttr('selected').prop('selected', false);
				});
				
				$('#countries_selector').multiselect('refresh');
				
				globalSubject = subject
				
			}
			
        }
	});
	
	function initCountriesSelector(){
		
		$('#countries_selector').multiselect({
			
			onChange: function(option, checked) {
				
				if(checked){
					//console.log(d3.selectAll('.lines').selectAll('path'))
					country = option[0].text
					
					d3.selectAll('.lines').attr('fixed', function(d){
				
						var stroke = d3.select(this).select('path').attr('stroke')
				
						var gs = d3.select(this).attr('location')
					
						if (gs == country && stroke == 'steelblue'){
							
							d3.select(this).selectAll('path')
							.attr('stroke-width', 2)
							.attr("stroke-opacity", 0.7)
							.attr("stroke", '#FF8066')
							
							d3.select(this).selectAll('circle')
							.attr("opacity", 0.5)
							
							d3.select(this).selectAll('text')
							.attr("fill-opacity", 0.9)
							
							d3.select(this).selectAll('rect')
							.attr("fill-opacity", 0.9)
							
							return '1'
						} 
						
						else return '0'
						
						
					})
				}
				else{
					
					country = option[0].text
					
					d3.selectAll('.lines').attr('fixed', function(d){
									
						var stroke = d3.select(this).select('path').attr('stroke')
									
						var gs = d3.select(this).attr('location')
					
						if (gs == country && stroke == '#FF8066'){
							
							d3.select(this).selectAll('path')
							.attr('stroke-width', 1.5)
							.attr("stroke-opacity", 0.3)
							.attr("stroke", 'steelblue')
							
							d3.select(this).selectAll('circle')
							.attr("fill-opacity", 0)
							
							d3.select(this).selectAll('text')
							.attr("fill-opacity", 0)
							
							d3.select(this).selectAll('rect')
							.attr("fill-opacity", 0)
							
							return '0'
						} 
						
						else return '1'
						
						
					})
				}
				
			}
		});
		
		
	}
	
	initCountriesSelector()
 
	let x = d3.scaleLinear()
		.domain([2008, 2017])
		.range([margin.left, width - margin.right])
		
	let y = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.VALUE)]).nice()
		.range([height - margin.bottom, margin.top])
		
		
	const svg = d3.select('#chart_container').append('svg')
		.attr('width', width)
		.attr('height', height)
		
	svg.append("clipPath")       // define a clip path
		.attr("id", "rect-clip") // give the clipPath an ID
		.append("rect")          // shape it as an ellipse
		.attr("x", margin.left)         // position the x-centre
		.attr("y", margin.top)         // position the y-centre
		.attr("width", width - margin.left - margin.right)         // set the x radius
		.attr("height", height - margin.top - margin.bottom);         // set the y radius
		
	svg.append("g")
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

	svg.append("g")
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
			.attr("x", 3)
			.attr("text-anchor", "start")
			.attr("font-weight", "bold")
			.text(data.y))
			
	svg.append("rect")
		.attr('width', width - margin.left - margin.right)
		.attr('height', height - margin.top - margin.bottom)
		.attr('x', margin.left)
		.attr('y', margin.top)
		.attr('fill', 'grey')
		.attr('fill-opacity', '0.1')

	let line = d3.line()
		.defined(d => !isNaN(d.value))
		.x(d => x(d.date))
		.y(d => y(d.value))
		
	for (let location in dataGroup){
		
		for(let subject in dataGroup[location]){
			
			
			let points = dataGroup[location][subject]
			
			if(points.length > 1){
				
				let Aline = svg.append('g')
					.attr("subject", subject)
					.attr("location", location)
					.attr('class','lines')
							
				let myRect = Aline.append('rect')
				.datum(points[points.length-1])
				.attr('x', d => x(d.date) + 10)
				.attr('y', d => y(d.value) - 10)
				.attr('width', 3)
				.attr('height', 10)
				.attr('fill', 'steelblue')
				.attr("fill-opacity", 0)

				Aline.append('text')
				.datum(points[points.length-1])
				.attr('class','label')
				.attr('x', d => x(d.date) + 20)
				.attr('y', d => y(d.value))
				.attr("fill-opacity", 0)
				.text(d => location)
				
				Aline.append("path")
					.attr('clip-path','url(#rect-clip)')
					.datum(points)
					.attr("subject", subject)
					.attr("location", location)
					.attr("fill", "none")
					.attr("stroke", "steelblue")
					.attr("stroke-width", 1.5)
					.attr("stroke-opacity", .3)
					.attr("stroke-linejoin", "round")
					.attr("stroke-linecap", "round")
					.attr("d", line);
					
				Aline.selectAll('circle')
					.data(points)
					.enter()
					.append("circle")
					.attr('class','tickMeta')
					.attr("fill", "black")
					.attr("stroke", "white")
					.attr("opacity", 0)
					.attr('r',3)
					.attr('cx', d => x(d.date))
					.attr('cy', d => y(d.value))
					
				Aline.selectAll('text')
					.data(points)
					.enter()
					.append("text")
					.attr('class','tick')
					.attr("fill", "black")
					.attr("fill-opacity", 0)
					.attr('x', d => x(d.date) - 10)
					.attr('y', d => y(d.value) + 15)
					.text(d => parseInt(d.value))
					
				Aline.on('mouseover', function(d){
					
					var gs = d3.select(this).attr('subject')
				
					if (gs == globalSubject){
						
						d3.select(this).selectAll('path')
						.transition()
						.attr('stroke-width', 2.5)
						.attr("stroke-opacity", 1)
					
						d3.select(this).selectAll('circle')
						.transition()
						.attr("opacity", 0.5)
						
						d3.select(this).selectAll('text')
						.transition()
						.attr("fill-opacity", 0.9)
						
						d3.select(this).selectAll('rect')
						.transition()
						.attr("fill-opacity", 0.9)
					}
					
					
				})
				
				Aline.on('mouseout', function(d){
					
					let fixed = d3.select(this).attr('fixed')
					
					if(fixed == 1 || fixed == '1') return
					
					d3.select(this).select('path')
					.transition()
					.attr("stroke-width", 1.5)
					.attr("stroke-opacity", .3)
					
					d3.select(this).selectAll('circle')
					.transition()
					.attr("opacity", 0)
					
					d3.select(this).selectAll('text')
					.transition()
					.attr("fill-opacity", 0)
					
					d3.select(this).selectAll('rect')
					.transition()
					.attr("fill-opacity", 0)
					
				})
			}
			
		}
	}
	
	globalSubject = 'BUPPSRY'
	d3.selectAll('.lines').selectAll('path').attr('stroke', function(d){
		
		var gs = d3.select(this).attr('subject')
		
		if (gs == globalSubject) return 'steelblue'
		else return 'none'
	})
	  
	
	
 });
 