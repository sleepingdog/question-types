// JavaScript Document: Sample Object-Match Question Type: What is Road Sign?
var roadsignXml; //create the XML object to hold the RoadSign XML.
var roadsignParent; //element holding the roadsign SVG.
var roadsignXslt; //to hold XSLT used to transform RoadSign XML into SVGs.
var	roadsignSvg; //document to hold generated roadsign SVG.
var correctAnswer; // holds the RoadSign XML correct answer to compare learner's answer with.
var bmatch; // do the learner's and correct answers match? binary.

function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) {
		xhttp = new XMLHttpRequest();
		}
	else {
		xhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
	xhttp.open("GET",dname,false);
	xhttp.send("");
	return xhttp.responseXML;
}

function xml2Str(xmlNode) { // convert XML to string:
   try {
      // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
      return (new XMLSerializer()).serializeToString(xmlNode);
  }
  catch (e) {
     try {
        // Internet Explorer.
				// from http://msdn.microsoft.com/en-us/library/ie/ff975252(v=vs.85).aspx
				//oXmlSerializer =  new XMLSerializer();
				//sXmlString = oXmlSerializer.serializeToString(xmlNode);
        //return sXmlString;
				// from http://ie.microsoft.com/testdrive/HTML5/DOMParserXMLSerializer/Default.html
				var serializer = new XMLSerializer();
				var sXmlString = serializer.serializeToString(xmlNode);
        return sXmlString;
     }
     catch (e) {  
        //Other browsers without XML Serializer
        alert('Xmlserializer not supported');
     }
   }
   return false;
}

function str2Xml(string, itype) { // convert string to XML defined by Internet media type
	var xmlDoc;
	if (window.DOMParser) {
			//parser = new DOMParser();
			//xmlDoc = parser.parseFromString(string,"text/xml");
			var parser = new DOMParser();
			xmlDoc = parser.parseFromString(string, itype);
	}
	else { // Internet Explorer
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async="false";
		xmlDoc.loadXML(string); 
		//http://msdn.microsoft.com/en-us/library/ie/ff975278(v=vs.85).aspx
		//oParser =  new DOMParser();
		//oDocument = oParser.parseFromString(xmlSource, mimeType);
	}
	return xmlDoc;
}

function createRoadSignXml() {
	try {
		roadsignXml = loadXMLDoc("roadsign.xml");
		roadsignSvg = loadXMLDoc("roadsign.svg");
		//document.getElementById("roadsign").appendChild(roadsignSvg);
		correctAnswer = loadXMLDoc("giveway.xml"); // definition of "give way to traffic on major road" road sign: the correct answer.
	}
	catch(ex) {
		alert(ex);
	}
}

function displayResult() { // convert RoadSign XML to SVG and display the various outputs.
	// disable until xml2Str() works in Internet Explorer; currently only used diagnostically
	/*
	var xmlString1 = xml2Str(roadsignXml);
	document.getElementById("xmlSource").value = xmlString1;
	var xmlString2;
	*/
	roadsignSvg = document.querySelector("#roadsign svg");
	var outputSvg = transformXml(roadsignXml,roadsignXslt); // output SVG.
	// disable until xml2Str() works in Internet Explorer; currently only used diagnostically
	/*
	xmlString2 = xml2Str(outputSvg);
	document.getElementById("svgSource").value = xmlString2;
	*/
	roadsignParent.replaceChild(outputSvg, roadsignSvg);
}

function transformXml (xml, xslt) {
	try {
		// code for Mozilla, Firefox, Opera, etc.
		xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet(xslt);
		resultRoadSignDoc = xsltProcessor.transformToFragment(xml, document);
		return resultRoadSignDoc;
	}
	catch(ex) {
		try {
			// code for MSIE? from http://www.roelvanlisdonk.nl/?p=2113
			if (window.ActiveXObject) {
				var xsltAXO = new ActiveXObject("Msxml2.XSLTemplate");
				var xslDoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument");
				xslDoc.loadXML(xslt.xml);
				xsltAXO.stylesheet = xslDoc;
				var xslProc = xsltAXO.createProcessor();
				xslProc.input = xml;
				xslProc.transform();			
				return xslProc.output;
			}
		}
		catch(ex){
			alert(ex);
		}
	}
}

function initialize () {
	roadsignParent = document.getElementById("roadsign");
	roadsignXslt = loadXMLDoc("roadsigntosvg.xslt");
	createRoadSignXml();
	displayResult();
	document.frmDesign.reset(); //reset the design form when the document (re)loads.
	document.frmFeedback.reset();
}

function updateRoadSign (element, attribute, value) { // On change of controls, update the roadsign and re-display the result.
	try {
		xmlElementNode = roadsignXml.getElementsByTagName(element);
		xmlElementNode.setAttribute(attribute, value);
	}
	catch(ex) {
		//alert(ex);
		try {
			xmlElementNode = roadsignXml.getElementsByTagName(element)[0];
			xmlAttributeNode = xmlElementNode.getAttributeNode(attribute);
			xmlAttributeNode.nodeValue = value;
		}
		catch(ex) {
			alert(ex);
		}
	}
	displayResult();
	//displayMark();
}

function displayMark () {
	var mark = document.getElementById("mark");
	// build rows in score table to provide detailed feedback
	var scoreTable = document.getElementById("scoretable");
	var rowCount = 0;
	var bmatch = 1;
	var propertiesLA = roadsignXml.documentElement.childNodes;
	var propertiesCA = correctAnswer.documentElement.childNodes;
	for (i = 0; i < propertiesLA.length; i++) {
		// add cells to score table
		if (propertiesLA[i].nodeType == 1) {
			rowCount += 1;
			var scoreRow = scoreTable.insertRow(rowCount);
			var cell1 = scoreRow.insertCell(0);
			var cell2 = scoreRow.insertCell(1);
			var cell3 = scoreRow.insertCell(2);
			var cell4 = scoreRow.insertCell(3);
			cell1.innerHTML = propertiesLA[i].nodeName + " " + propertiesLA[i].attributes[0].nodeName;
			cell2.innerHTML = propertiesLA[i].attributes[0].nodeValue;
			cell3.innerHTML = propertiesCA[i].attributes[0].nodeValue;
			if (propertiesLA[i].attributes[0].nodeValue != propertiesCA[i].attributes[0].nodeValue) {
				bmatch -= 1;
				cell2.setAttribute("class", "nomatch");
				cell4.innerHTML = "0";
			} else {
				cell2.setAttribute("class", "match");
				cell4.innerHTML = "1";
			}
		}
	}
	if (bmatch == 1) {
		mark.setAttribute("class", "match");
		mark.innerHTML = "match";
	} else {
		bmatch = 0;
		mark.setAttribute("class", "nomatch");
		mark.innerHTML = "no match";
	}
	scoreTable.style.display = "block";
}

function acceptAnswer(input) {
	displayMark();
	input.disabled = true;
	return false;
}
