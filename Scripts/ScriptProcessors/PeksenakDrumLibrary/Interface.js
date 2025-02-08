/*
	Peksenak Drum Library
	
	Copyright 2025 Zachary Pierce

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this file. If not, see <http://www.gnu.org/licenses/>.
*/

Content.makeFrontInterface(1000, 624);

Engine.loadAudioFilesIntoPool();
Engine.loadImageIntoPool("{PROJECT_FOLDER}\Images\*");
Synth.deferCallbacks(true);

// Mute/Solo/Volume/Send Controls //
namespace ChannelMixer
{
const ALL_CHAN = 11;

const soloState = [];

const Vol = [];
const Solo = [];
const Mute = [];

const VVol = [];
const VMute = [];

const fxVrb = Synth.getAllEffects("Vrb");

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

// Toggle IR's //
const ConvolutionReverbEffect = Synth.getAudioSampleProcessor("Convolution Reverb1");
const ConvSelect = Content.getComponent("ConvSelect");
const ConvLabel = Content.getComponent("ConvLabel");


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

// Expandable UI Keyboard//
var keyPanelA = 0;

inline function onResizeButtonControl(component, value)
{
	keyPanelA = (624 + value * 76);

	Content.setHeight(keyPanelA);
};
Content.getComponent("ResizeButton").setControlCallback(onResizeButtonControl);

const p = Content.addPanel("KeyPanel", 0, 624);
p.set("width", 1000);

p.loadImage("{PROJECT_FOLDER}pdl_keyboard_background.png", "keyBackground");
p.setPaintRoutine(function(g)
{
	 g.drawImage("keyBackground", [0, 0, 1000, keyPanelA], 0, 0);
});

// Keyboard Auto Color //
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
		Engine.setKeyColour(i, Colours.withAlpha(Colours.white, 0.0));
		
	for (i = 0; i < 128; i++)
	{
		for (s in samplers)
		{
			if (s.isNoteNumberMapped(i))
			Engine.setKeyColour(i, Colours.withAlpha(Colours.darkcyan, 0.4));
		}
	}	
}
setKeyColours();

// Performance Meter //
const var pnlPerformance = Content.getComponent("pnlPerformance");

pnlPerformance.setPaintRoutine(function(g)
{
	var a = this.getLocalBounds(0);
	
	g.setColour(this.get("textColour"));
	g.drawAlignedText(this.get("text"), a, "right");
});

pnlPerformance.setTimerCallback(function()
{
	var cpuInt = Engine.getCpuUsage() * 0.5;
	var cpuUsage = Engine.doubleToString(cpuInt, 1) + "%";
	var ramUsage = Engine.doubleToString(Engine.getMemoryUsage(), 1) + "MB";
	var voices = Engine.getNumVoices();

	this.set("text", "CPU: " + cpuUsage + " | RAM: " + ramUsage + " | Voices: " + voices);
	this.repaint();
});
pnlPerformance.startTimer(500);

// Show/Hide Panels //
const Mix = [];
const MixPanel = [];

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

// Paint Panel Backgrounds (Kick, Rack, Floor, Hat, Ride) //
const Paint1 = [];

for (i = 0; i < 5; i++)
{
	Paint1[i] = Content.getComponent("MixPanel"+i);
	Paint1[i].loadImage("{PROJECT_FOLDER}pdl_mix_1.png", "panel1");
	Paint1[i].setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
			
		g.drawImage("panel1", a, 0, 0);
	});
}

//Paint Panel Backgrounds (Snare) //
const var MixPanel5 = Content.getComponent("MixPanel5");

MixPanel5.loadImage("{PROJECT_FOLDER}pdl_mix_2.png", "panel5");
MixPanel5.setPaintRoutine(function(g)
{
	var a = this.getLocalBounds(0);
	
	g.drawImage("panel5", a, 0, 0);
});

//Paint Panel Backgrounds (Spot Mics) //
const var MixPanel6 = Content.getComponent("MixPanel6");

MixPanel6.loadImage("{PROJECT_FOLDER}pdl_mix_3.png", "panel6");
MixPanel6.setPaintRoutine(function(g)
{
	var a = this.getLocalBounds(0);
	
	g.drawImage("panel6", a, 0, 0);
});

//Paint Panel Backgrounds (Percussion) //
const var MixPanel7 = Content.getComponent("MixPanel7");

MixPanel7.loadImage("{PROJECT_FOLDER}pdl_mix_4.png", "panel7");
MixPanel7.setPaintRoutine(function(g)
{
	var a = this.getLocalBounds(0);
	
	g.drawImage("panel7", a, 0, 0);
});

//Populate and Connect ComboBox Routing //
namespace OutputDropdown
{
const matrix = Synth.getRoutingMatrix("PeksenakDrumLibrary");		
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

// Master Meters Filmstrip //

//Left Meter
const lafL = Content.createLocalLookAndFeel();

lafL.loadImage("{PROJECT_FOLDER}pdl_vu_left.png", "vuL");
lafL.registerFunction("drawMatrixPeakMeter", function(g, obj)
{

	var a = obj.area;
	var z_value = 0;
	var frames = 91;
	var zerpnt = 64;
	
	for (i = 0; i < 1; i++)
	{
		var z = obj.peaks[i];
		
       	if (z <= 1.0)
		z_value = Math.round((zerpnt - 1) * z);
				
       	else if (z > 1.0 && z <= 1.2)
		z_value = Math.round((zerpnt - 1) + (frames - zerpnt) * (z - 0.75)/0.413);
		
		else
		z_value = frames - 1;
			
		g.drawImage("vuL", [0, 0, 42, a[3]], 0, 639 * z_value);				
	}
});
const var MasterL = Content.getComponent("MasterL");
MasterL.setLocalLookAndFeel(lafL);

//Right Meter
const lafR = Content.createLocalLookAndFeel();

lafR.loadImage("{PROJECT_FOLDER}pdl_vu_right.png", "vuR");
lafR.registerFunction("drawMatrixPeakMeter", function(g, obj)
{

	var a = obj.area;
	var z_value = 0;
	var frames = 91;
	var zerpnt = 64;
		
	for (i = 0; i < 1; i++)
	{
		var z = obj.peaks[i];
		
       	if (z <= 1.0)
		z_value = Math.round((zerpnt - 1) * z);
				
       	else if (z > 1.0 && z <= 1.2)
		z_value = Math.round((zerpnt - 1) + (frames - zerpnt) * (z - 0.75)/0.413);

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
 