//
import { InstanceBase, runEntrypoint } from '@companion-module/base'


//const UpgradeScripts = require('./upgrades')
import { UpgradeScripts } from './upgrades.js'
import { getVariables } from './variables.js'
import { getFeedbacks } from './feedback.js'
import osc from "osc"
//const Feedbacks = require('./feedback')



/*
 *Examples
 * https://github.com/bitfocus/companion-module-vdo-ninja/tree/b6fd1bac53c093f17548de42537d83cee16c8325
 * 
 */


var debug;

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		//Object.assign(this, { ...Variables})
		//this.updateVariables = updateVariables
	}

	actions(system) {
		this.setVariableValues(this.getVariables());
		
	}

	async init(config) {
		debug = this.debug;
		this.config = config
		this.init_osc();

		this.updateStatus('ok')
		this.initVariables();
		this.updateActions(); // export actions
		this.initFeedbacks();
		
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
	}
	initVariables() {
		const variables = getVariables.bind(this)()
		this.setVariableDefinitions(variables)
		for (let i = 0; i < 33; i++) {
			let setvar = "flexmute" + i + "status"
			this.setVariableValues({ [setvar]: " " });
		}
		this.flexmute = [];
		this.groupmute = [];
		this.groupfade = [];
		console.log("variables set")
	}

	initFeedbacks() {
		const feedbacks = getFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				//regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'send_port',
				label: 'Send Port',
				width: 4,
				//regex: Regex.PORT,
			},
			{
				type: 'textinput',
				id: 'recieve_port',
				label: 'Recieve Port',
				width: 4,
				//regex: Regex.PORT,
			},
		]
	}

	updateActions() {
		const sendOscMessage = (path, args) => {
			
			this.log('debug', `Sending OSC ${this.config.host}:${this.config.send_port} ${path} ${JSON.stringify(args) }`)
			this.oscSend(this.config.host, this.config.send_port, path, args)
		}

		this.setActionDefinitions({

			flex_mute: {
				name: 'Flex Channel mute',
				options: [
					{
						id: 'flexchnl_mute',
						type: 'number',
						label: 'Flex Channel',
						default: 1,
						min: 1,
						max: 32,
					},
					{
						type: 'textinput',
						label: 'Value',
						id: 'float',
						default: 1,
						//regex: Regex.SIGNED_FLOAT,
						useVariables: true,
					},
					
				],
				callback: async (event) => {
					var num = await this.parseVariablesInString(event.options.flexchnl_mute);
					const path = (`/settings/flex_channel/${num}/mute`);
					const float = await this.parseVariablesInString(event.options.float);
					var whoami = 'flex_channel' + num + 'status';
					console.log(`whoami is:  ${whoami}`);
					var currstat = this.getVariableValue(whoami);
					if (currstat == 'Muted') {
						console.log('if then thinks we are muted');
						this.setVariableValues({ [whoami]: 'Unmuted', });
						this.flexmute[num] = "Unmuted";
						sendOscMessage(path, [
							{
								type: 'f',
								value: 0,
							},

						])
						console.log(`message sent?`);
					}
					if (currstat == 'Unmuted') {
						console.log('if then thinks we are Unmuted');
						this.setVariableValues({ [whoami]: 'Muted', });
						this.flexmute[num] = "Muted";
						
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
						console.log(`message sent?`);
					}
					if (currstat == " ") {
						console.log("whoami not defined");
						this.setVariableValues({ [whoami]: 'Muted', });
						this.flexmute[num] = "Muted";
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
						console.log(`did we send stuff?`)
                    }
					this.checkFeedbacks('flexmutestatus');

					this.parseVariablesInString(event.options.flexmutestatus);


					

				},
			},

			group_mute: {
				name: 'Group mute',
				options: [
					{
						id: 'group_mute',
						type: 'number',
						label: 'Group',
						default: 1,
						min: 1,
						max: 16,
					},
					{
						type: 'textinput',
						label: 'Value',
						id: 'group_float',
						default: 1,
						//regex: Regex.SIGNED_FLOAT,
						useVariables: true,
					},

				],
				callback: async (event) => {
					
					var num = await this.parseVariablesInString(event.options.group_mute);
					const path = (`/settings/group/channel/${num}/mute`);
					const float = await this.parseVariablesInString(event.options.group_float)
					var whoami = 'group' + num + 'status';
					var currstat = this.getVariableValue(whoami);
					console.log(`currstat is:  ${currstat}`)
					if (currstat == 'Unmuted') {
						console.log('if then thinks we are Unmuted');
						this.setVariableValues({ [whoami]: 'Muted', });
						//this.group_mute[num] = "Muted";
						console.log(`Sending`);
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
						console.log(`group sent command?`)
					}
					if (currstat == 'Muted') {
						console.log('if then thinks we are Muted');
						this.setVariableValues({ [whoami]: 'Unmuted', });
						//this.group_mute[num] = "Unmuted";
						console.log(`Sending`);
						sendOscMessage(path, [
							{
								type: 'f',
								value: 0,
							},

						])
						console.log(`group sent command?`)
					}
					if (currstat == "") {
						console.log('if then thinks we are Not Defined');;
						this.setVariableValues({ [whoami]: 'Muted', });
						//this.group_mute[num] = "Muted";
						console.log(`Sending`);
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
						console.log(`group sent command?`)
					}
					this.parseVariablesInString(event.options.group_mute)
					this.checkFeedbacks('flexmutestatus');

					/*sendOscMessage(path, [
						{
							type: 'f',
							value: parseFloat(float),


						},

					])*/

				},
			},


			MtxMaster_mute: {
				name: 'Matrix Mixer Master mute',
				options: [
					{
						id: 'MtxMaster_mute',
						type: 'number',
						label: 'Matrix Master Mute',
						default: 1,
						min: 1,
						max: 16,
					},
					{
						id: 'MtxMixer_Number',
						type: 'number',
						label: 'Matrix Mixer Number',
						default: 1,
						min: 1,
						max: 16,
					},
					{
						type: 'textinput',
						label: 'Value',
						id: 'MtxMaster_float',
						default: 1,
						useVariables: true,
					},

				],
				callback: async (event) => {

					var num = await this.parseVariablesInString(event.options.MtxMaster_mute);
					var mixnum = await this.parseVariablesInString(event.options.MtxMixer_Number);
					const path = (`/settings/mixer/${mixnum}/master/${num}/mute`);
					const float = await this.parseVariablesInString(event.options.MtxMaster_float)
					var whoami = 'MtxMasterMute' + num + 'status';
					var currstat = this.getVariableValue(whoami);
					console.log(`whoami is:  ${whoami}`)
					console.log(`currstat is:  ${currstat}`)
					if (currstat == 'Unmuted') {
						console.log('if then thinks we are Unmuted');
						this.setVariableValues({ [whoami]: 'Muted', });
						console.log(`Sending`);
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
						console.log(`MtxMaster sent command?`)
					}
					if (currstat == 'Muted') {
						console.log('if then thinks we are Muted');
						this.setVariableValues({ [whoami]: 'Unmuted', });
						console.log(`Sending`);
						sendOscMessage(path, [
							{
								type: 'f',
								value: 0,
							},

						])
						console.log(`MtxMaster sent command?`)
					}
					if (currstat == "") {
						console.log('if then thinks we are Not Defined');;
						this.setVariableValues({ [whoami]: 'Muted', });
						console.log(`Sending`);
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
						console.log(`MtxMaster sent command?`)
					}
					this.parseVariablesInString(event.options.MtxMaster_mute)
					this.checkFeedbacks('flexmutestatus');



				},
			},


			layout_trigger: {
				name: 'Generic Trigger',
				options: [
					
					
					{
						id: 'layouttrig_command',
						type: 'textinput',
						label: 'Layout Trigger Command',
						default: "/osc/command",
						min: 0,
						max: 100,
					},
				],
				callback: async (event) => {
					console.log('Hello world!', event.options.num)
					sendOscMessage(event.options.layouttrig_command, [
						{
							type: 'f',
							value: 1,
						},

					])
				},
			},

			Fade_trigger: {
				name: 'Group Fade Trigger',
				options: [
					{
						id: 'group_fade',
						type: 'number',
						label: 'Group Fade number',
						default: 1,
						min: 1,
						max: 16,
					},
					{
						type: 'textinput',
						label: 'Value',
						id: 'group_fade_float',
						default: 1,
						//regex: Regex.SIGNED_FLOAT,
						useVariables: true,
					},
				],
				callback: async (event) => {
					
					var num = event.options.group_fade;
					console.log(`current fade status is ${this.groupfade[num]}`)
					console.log(`fade button for group ${num} was pressed`)
					const path = (`/groupfade/${num}`);
					
					if (this.groupfade[num] === 'in') {
						console.log("we need to change to out")
						this.groupfade[num] = "out";
						console.log(`sending fade out message`)
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},
						])
					} else if (this.groupfade[num] === 'out') {
						console.log("we need to change to in")
						this.groupfade[num] = "in";
						console.log(`sending fade in message`)
						sendOscMessage(path, [
							{
								type: 'f',
								value: 0,
							},
						])
					}
					if (typeof (this.groupfade[num]) == "undefined") {
						console.log("we don't have a group fade variable assigned");
						this.groupfade[num] = "out";
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},
						])
					}

					this.checkFeedbacks('groupfadestatus');


					
				},
			},

		})
	}

	init_osc() {

		if (this.connecting) {
			return;
		}

		if (this.qSocket) {
			this.qSocket.close();
		}

		if (this.config.host) {
			this.qSocket = new osc.UDPPort({
				localAddress: "0.0.0.0",
				localPort: this.config.recieve_port,
				address: this.config.host,
				port: this.config.port,
				metadata: true
			});
			this.connecting = true;

			this.qSocket.open();

			this.qSocket.on("error", (err) => {
				//console.log("debug", err);
				this.log('error', "Error: " + err.message);
				this.connecting = false;
				//this.status(this.STATUS_ERROR, "Can't connect to Glogconn");
				if (err.code == "ECONNREFUSED") {
					this.qSocket.removeAllListeners();
				}
			});

			this.qSocket.on("close", () => {
				this.log('error', "Connection to Globcon Closed");
				this.connecting = false;
				this.status(this.STATUS_WARNING, "CLOSED");
			});

			this.qSocket.on("ready", () => {
				this.connecting = false;
				this.log('info', "Connected to Globconn:" + this.config.host);
			});

			this.qSocket.on("message", (message) => {
				this.processMessage(message);
				//this.checkFeedbacks();

			});

			this.qSocket.on("data", (data) => {
			});

			/*setInterval(() => {
				this.init_polling();
			}, 10000);*/
		}
	}

	processMessage(message) {
		console.log("Got address: ", message.address);
		console.log("Got args: ", message.args);
		let address = message.address
		let args = message.args
		
		var mutestatus = message.args[0].value;
		if (address.includes('flex_channel') || address.includes('group')) {
			console.log(`starting processFlexmute`)
			this.processFlexMute(address, mutestatus);

		}
		if (address.includes('groupfade')) {
			this.processFade(address, mutestatus);
        }
	}

	processFlexMute(address,args) {
		console.log("Processing flex mute now");
		//split the osc address into an array to get all of the pieces to shift the information where it needs to go
		const addyarray = address.split("/");
		//var varstuff = this.getVariableValue("myvar");
		
		console.log(`args is: ${args}`);
		//i is the channel number of the incomming osc command
		const addylength = addyarray.length;
		console.log(`Address Length is:  ${addylength}`)

		var anotherstring = "myvar"
		var mutestring;
		var chtype;
		var i;

		if (addylength == 5) {
			i = addyarray[3];
			console.log(`i is ${i}`);

			mutestring = addyarray[2] + [i] + "status";

			chtype = addyarray[2];
			console.log(`addyarray[2] is: ${addyarray[2]}`);
			console.log(`mutestring is equal to ${mutestring} `);


		} else {
			i = addyarray[4];
			console.log(`i is ${i}`);

			mutestring = addyarray[2] + [i] + "status";

			chtype = addyarray[2];
			console.log(`addyarray[2] is: ${addyarray[2]}`);
			console.log(`mutestring is equal to ${mutestring} `);
        }
		
		//this[mutestring] = args;
		if (args === 1) {
			//this.setVariableValues([mutestring], "Muted");
			if (chtype == "flex_channel") {
				console.log(`a flex channel sent this message`)
				this.flexmute[i] = "Muted"
			} else {
				console.log(`a group sent this message`)
				this.groupmute[i] = "Muted"
            }
			
			this.setVariableValues({ [mutestring]: "Muted" });
			this.setVariableValues({ [anotherstring]: "Unmuted" });
			//console.log(`Flex Channel ${i} is:  ${this.getVariableValue(mutestring)}`);
		} else {
			if (chtype === "flex_channel") {
				console.log(`a flex channel sent this message`)
				this.flexmute[i] = "Unuted"
			} else {
				console.log(`a group sent this message`)
				this.groupmute[i] = "Unuted"
			}
			
			this.setVariableValues({ [mutestring]: "Unmuted" });
			this.setVariableValues({ [anotherstring]: "Muted" });
			//console.log(`Flex Channel ${i} is:  ${this.getVariableValue(mutestring) }`);
		}
		this.checkFeedbacks('flexmutestatus');

	}

	processFade(address, args) {
		console.log(`processing fade:  ${address}`);
		const addyarray = address.split("/");
		

		console.log(`args is: ${args}`);
		//i is the channel number of the incomming osc command
		let i = Number(addyarray[2]);
		console.log(`i is ${i}`);
		console.log(`Group fade variable is: ${this.groupfade[i]}`)
		if (typeof(this.groupfade[i]) == "undefined") {
			console.log("we don't have a group fade variable assigned");
			if (args == '1') {
				this.groupfade[i] = "out";
			}
			if(args == '0')	{
				this.groupfade[i] = "in";
            }
			
			//1
		}
		if (args == '1'){
			this.groupfade[i] = 'out'
		}
		if (args == '0') {
			this.groupfade[i] = 'in'

		}
		this.checkFeedbacks('groupfadestatus');


	}


	pollprodigy() {
		const path = (`/pollallvalues/`);
		sendOscMessage(path, [
			{
				type: 'f',
				value: 1,
			},

		])
    }

	

}

runEntrypoint(ModuleInstance, UpgradeScripts)
