Content.makeFrontInterface(1000, 624);

Engine.loadAudioFilesIntoPool();
Synth.deferCallbacks(true);

// Mute/Solo/Volume Controls ////////////////////////////////////////////////////////////
namespace ChannelMixer
{
const ALL_CHAN = 11;

const soloState = [];

const Vol = [];
const Solo = [];
const Mute = [];

const VVol = [];
const VMute = [];


// Verb Sends (Send FX)
const fxVrb = Synth.getAllEffects("Vrb");

// Volume Controls (Simple Gain FX)
const fxVol = [];
fxVol[0] = Synth.getEffect("KickDir");
fxVol[1] = Synth.getEffect("SnrAVol");
fxVol[2] = Synth.getEffect("RackDir");
fxVol[3] = Synth.getEffect("FloorDir");
fxVol[4] = Synth.getEffect("HihatDir");
fxVol[5] = Synth.getEffect("RideDir");
fxVol[6] = Synth.getEffect("OvhBVol");
fxVol[7] = Synth.getEffect("RoomVol");
fxVol[8] = Synth.getEffect("SpotVol");
fxVol[9] = Synth.getEffect("PercVol");
fxVol[10] = Synth.getEffect("VerbVol");

// UI Components
for (i = 0; i < ALL_CHAN; i++)
{
	Vol.push(Content.getComponent("Vol" + i));
	Vol[i].setControlCallback(onVolControl);

	Solo.push(Content.getComponent("Solo" + i));
	Solo[i].setControlCallback(onSoloControl);

	Mute.push(Content.getComponent("Mute" + i));
	Mute[i].setControlCallback(onMuteControl);

	VVol.push(Content.getComponent("VVol" + i));
	VVol[i].setControlCallback(onVVolControl);

	VMute.push(Content.getComponent("VMute" + i));
	VMute[i].setControlCallback(onVMuteControl);
}

inline function onVolControl(component, value)
{
	local idx = Vol.indexOf(component);
	if ((!Mute[idx].getValue() && !soloState.contains(1)) || Solo[idx].getValue())
	fxVol[idx].setAttribute(fxVol[idx].Gain, value);
}

inline function onSoloControl(component, value)
{
	local idx = Solo.indexOf(component);
	soloState[idx] = value;
	channelSoloMute();
}

inline function onMuteControl(component, value)
{
	channelSoloMute();
}

inline function onVVolControl(component, value)
{
	local idx = VVol.indexOf(component);
	if (!VMute[idx].getValue())
	fxVrb[idx].setAttribute(fxVrb[idx].Gain, value);
}

inline function onVMuteControl(component, value)
{
	local idx = VMute.indexOf(component);
	if (!VMute[idx].getValue())
	fxVrb[idx].setAttribute(fxVrb[idx].Gain, VVol[idx].getValue());
	else
	fxVrb[idx].setAttribute(fxVrb[idx].Gain, -100);
}

inline function channelSoloMute()
{
	for (i = 0; i < ALL_CHAN; i++)
	{
		if ((!soloState.contains(1) || Solo[i].getValue()) && (!Mute[i].getValue() || Solo[i].getValue()))
		fxVol[i].setAttribute(fxVol[i].Gain, Vol[i].getValue());
		else
		fxVol[i].setAttribute(fxVol[i].Gain, -100);
	}
}

}

// Toggle IR's //////////////////////////////////////////////////////////////////////////
const var ConvolutionReverbEffect = Synth.getAudioSampleProcessor("Convolution Reverb1");
const var ConvSelect = Content.getComponent("ConvSelect");
const var ConvLabel = Content.getComponent("ConvLabel");


inline function onConvSelectControl(component, value)
{
	if (value)
	{
		ConvolutionReverbEffect.setFile("{PROJECT_FOLDER}KitchenBackward.wav");
		ConvLabel.setValue("Backward");
	}
	else
	{	
		ConvolutionReverbEffect.setFile("{PROJECT_FOLDER}KitchenForward.wav");
		ConvLabel.setValue("Forward");
	}	
};
Content.getComponent("ConvSelect").setControlCallback(onConvSelectControl);

// Expandable UI Keyboard////////////////////////////////////////////////////////////////
var keyPanelA = 0;

inline function onResizeButtonControl(component, value)
{
	keyPanelA = (624 + value * 76); // Normal Height + (0/1) * Height of Keyboard Dropdown

	Content.setHeight(keyPanelA);
};
Content.getComponent("ResizeButton").setControlCallback(onResizeButtonControl);

const p = Content.addPanel("KeyPanel", 0, 624);
p.set("width", 1000);

p.loadImage("{PROJECT_FOLDER}keyback2.png", "keyBackground");
p.setPaintRoutine(function(g)
{
	 g.drawImage("keyBackground", [0, 0, 1000, keyPanelA], 0, 0);
});

// Keyboard Auto Color //////////////////////////////////////////////////////////////////
const samplerIds = Synth.getIdList("Sampler")
const samplers = [];

for (id in samplerIds)
	samplers.push(Synth.getSampler(id));
	
const pnlPreload = Content.getComponent("pnlPreload");
pnlPreload.setLoadingCallback(function(isPreloading)
{
	if (isPreloading)
		setKeyColours();
});

inline function setKeyColours()
{
	for (i = 0; i < 128; i++)
		Engine.setKeyColour(i, Colours.withAlpha(Colours.white, 0.0)); // Unassigned Colour
		
	for (i = 0; i < 128; i++)
	{
		for (s in samplers)
		{
			if (s.isNoteNumberMapped(i))
			Engine.setKeyColour(i, Colours.withAlpha(Colours.darkcyan, 0.4)); // Assigned Colour
		}
	}	
}
setKeyColours();

// Performance Meter ////////////////////////////////////////////////////////////////////
const var pnlPerformance = Content.getComponent("pnlPerformance");

pnlPerformance.setPaintRoutine(function(g)
{
	var a = this.getLocalBounds(0);
	
	g.setColour(this.get("textColour"));
	g.drawAlignedText(this.get("text"), a, "right");
});

pnlPerformance.setTimerCallback(function()
{
	var cpuUsage = Engine.doubleToString(Engine.getCpuUsage(), 1) + "%";
	var ramUsage = Engine.doubleToString(Engine.getMemoryUsage(), 1) + "MB";
	var voices = Engine.getNumVoices();

	this.set("text", "CPU: " + cpuUsage + " | RAM: " + ramUsage + " | Voices: " + voices);
	this.repaint();
});
pnlPerformance.startTimer(500);

// All Hidden Panels Show/Hide //////////////////////////////////////////////////////////
const Mix = []; 		// Any Button Named "Mix*"
const MixPanel = [];	// Any Panel Named "MixPanel*"

for (i = 0; i < 10; i++)
{
	MixPanel[i] = Content.getComponent("MixPanel"+i);
	Mix[i] = Content.getComponent("Mix"+i);
	Mix[i].setControlCallback(changePanel);
}

inline function changePanel(component, value)
{
	local idx = Mix.indexOf(component);
	
	for (i = 0; i < MixPanel.length; i++)
	{
		MixPanel[i].showControl(i == idx && value);
		Mix[i].setValue(i == idx && value);
	}
}

// Paint Panel Backgrounds (Kick, Rack, Floor, Hat, Ride) ///////////////////////////////
const Paint1 = [];

for (i = 0; i < 5; i++)
{
	Paint1[i] = Content.getComponent("MixPanel"+i);
	Paint1[i].loadImage("{PROJECT_FOLDER}panel-3fadert.png", "panel1");
	Paint1[i].setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
			
		g.drawImage("panel1", a, 0, 0);
	});
}

//Paint Panel Backgrounds (Snare) ///////////////////////////////////////////////////////
const var MixPanel5 = Content.getComponent("MixPanel5");

MixPanel5.loadImage("{PROJECT_FOLDER}panel-snaret.png", "panel5");
MixPanel5.setPaintRoutine(function(g)
{
	var a = this.getLocalBounds(0);
	
	g.drawImage("panel5", a, 0, 0);
});

//Paint Panel Backgrounds (Spot Mics) ///////////////////////////////////////////////////
const var MixPanel6 = Content.getComponent("MixPanel6");

MixPanel6.loadImage("{PROJECT_FOLDER}panel-spott.png", "panel6");
MixPanel6.setPaintRoutine(function(g)
{
	var a = this.getLocalBounds(0);
	
	g.drawImage("panel6", a, 0, 0);
});

//Paint Panel Backgrounds (Percussion) //////////////////////////////////////////////////
const var MixPanel7 = Content.getComponent("MixPanel7");

MixPanel7.loadImage("{PROJECT_FOLDER}panel-perct.png", "panel7");
MixPanel7.setPaintRoutine(function(g)
{
	var a = this.getLocalBounds(0);
	
	g.drawImage("panel7", a, 0, 0);
});

//Populate and Connect ComboBox Routing /////////////////////////////////////////////////
namespace OutputDropdown
{
const matrix = Synth.getRoutingMatrix("Master Chain");		
const ComboBox = Content.getAllComponents("ComboBox*");		

	for (i = 0; i < ComboBox.length; i++)					
	{
		ComboBox[i].setControlCallback(onComboBoxControl);		
		ComboBox[i].set("items", "1/2\n3/4\n5/6\n7/8\n9/10\n11/12\n13/14\n15/16\n17/18\n19/20\n21/22");
	}	

	inline function onComboBoxControl(component, value)
	{
		local index = ComboBox.indexOf(component);
		local v = (value - 1) * 2;
	
		matrix.addConnection(0 + (index * 2), v);
		local success = matrix.addConnection(1 + (index * 2), v + 1);
	
		if (!success)
		{
			matrix.addConnection(0 + (index * 2), 0);
			matrix.addConnection(1 + (index * 2), 1);
		}
	}
}

// Master Meters Filmstrip //////////////////////////////////////////////////////////////

//Left Meter
const lafL = Content.createLocalLookAndFeel();

lafL.loadImage("{PROJECT_FOLDER}masterBigL3.png", "vuL");
lafL.registerFunction("drawMatrixPeakMeter", function(g, obj)
{

	var a = obj.area;
	var z_value = 0;
	var frames = 91;
	var zerpnt = 64;
	
	for (i = 0; i < 1; i++)
	{
		var z = obj.peaks[i];
		
		// dB is < 0
       	if (z <= 1.0)
		z_value = Math.round((zerpnt - 1) * z);
				
		// dB is 0 - 6
       	else if (z > 1.0 && z <= 1.2)
		z_value = Math.round((zerpnt - 1) + (frames - zerpnt) * (z - 0.75)/0.413);
		
		// dB > 6
		else
		z_value = frames - 1;
			
		g.drawImage("vuL", [0, 0, 42, a[3]], 0, 639 * z_value);				
	}
});
const var MasterL = Content.getComponent("MasterL");
MasterL.setLocalLookAndFeel(lafL);

//Right Meter
const lafR = Content.createLocalLookAndFeel();

lafR.loadImage("{PROJECT_FOLDER}masterBigR3.png", "vuR");
lafR.registerFunction("drawMatrixPeakMeter", function(g, obj)
{

	var a = obj.area;
	var z_value = 0;
	var frames = 91;
	var zerpnt = 64;
		
	for (i = 0; i < 1; i++)
	{
		var z = obj.peaks[i];
		
		// dB is < 0
       	if (z <= 1.0)
		z_value = Math.round((zerpnt - 1) * z);
				
		// dB is 0 - 6
       	else if (z > 1.0 && z <= 1.2)
		z_value = Math.round((zerpnt - 1) + (frames - zerpnt) * (z - 0.75)/0.413);

		// dB > 6
		else
		z_value = frames - 1;
			
		g.drawImage("vuR", [0, 0, 42, a[3]], 0, 639 * z_value);			
	}	
});
const var MasterR = Content.getComponent("MasterR");
MasterR.setLocalLookAndFeel(lafR);function onNoteOn()
{
	
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 