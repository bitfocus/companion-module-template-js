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
		this.flexmute = {};
		this.groupmute = {};
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
			this.log('debug', `Sending OSC ${this.config.host}:${this.config.send_port} ${path}`)
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
					const path = (`/flexmute/${num}`);
					const float = await this.parseVariablesInString(event.options.float);
					var whoami = 'flexmute' + num + 'status';
					var currstat = this.getVariableValue(whoami);
					if (currstat == 'Muted') {
						//console.log('if then thinks we are muted');
						this.setVariableValues({ [whoami]: 'Unmuted', });
						this.flexmute[num] = "Unmuted";
						sendOscMessage(path, [
							{
								type: 'f',
								value: 0,
							},

						])
					}
					if (currstat == 'Unmuted') {
						//console.log('if then thinks we are Unmuted');
						this.setVariableValues({ [whoami]: 'Muted', });
						this.flexmute[num] = "Muted";
						
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
					}
					if (currstat == " ") {
						//console.log("whoami not defined");
						this.setVariableValues({ [whoami]: 'Muted', });
						this.flexmute[num] = "Muted";
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
                    }
					this.checkFeedbacks('flexmutestatus');

					//this.parseVariablesInString(event.options.flexmutestatus);


					

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
					const path = (`/groupmute/${num}`);
					const float = await this.parseVariablesInString(event.options.group_float)
					var whoami = 'flexmute' + num + 'status';
					var currstat = this.getVariableValue(whoami);
					if (currstat == 'Unmuted') {
						//console.log('if then thinks we are Unmuted');
						this.setVariableValues({ [whoami]: 'Muted', });
						this.groupmute[num] = "Muted";

						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
					}
					if (currstat == 'Muted') {
						
						this.setVariableValues({ [whoami]: 'Unmuted', });
						this.groupmute[num] = "Unmuted";
						sendOscMessage(path, [
							{
								type: 'f',
								value: 0,
							},

						])
					}
					if (currstat == " ") {
						//console.log("whoami not defined");
						this.setVariableValues({ [whoami]: 'Muted', });
						this.groupmute[num] = "Muted";
						sendOscMessage(path, [
							{
								type: 'f',
								value: 1,
							},

						])
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
			layout_trigger: {
				name: 'Layout Trigger',
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
		if (address.includes('flexmute') || address.includes('groupmute')){
			this.processFlexMute(address, mutestatus);

        }
	}

	processFlexMute(address,args) {
		console.log("Processing flex mute now");
		//split the osc address into an array to get all of the pieces to shift the information where it needs to go
		const addyarray = address.split("/");
		//var varstuff = this.getVariableValue("myvar");
		
		console.log(`args is: ${args}`);
		//i is the channel number of the incomming osc command
		let i = Number(addyarray[2]);
		console.log(`i is ${i}`);

		var mutestring = addyarray[1] + [i] + "status";

		var chtype = addyarray[1];
		console.log(`mutestring is equal to ${mutestring} `);
		var anotherstring = "myvar"
		
		//this[mutestring] = args;
		if (args === 1) {
			//this.setVariableValues([mutestring], "Muted");
			if (chtype === "flexmute") {
				console.log(`a flex channel sent this message`)
				this.flexmute[i] = "Muted"
			} else {
				console.log(`a group sent this message`)
				this.groupmute[i] = "Muted"
            }
			
			this.setVariableValues({ [mutestring]: "Muted" });
			this.setVariableValues({ [anotherstring]: "Unmuted" });
			console.log(`Flex Channel ${i} is:  ${this.getVariableValue(mutestring)}`);
		} else {
			if (chtype === "flexmute") {
				console.log(`a flex channel sent this message`)
				this.flexmute[i] = "Unuted"
			} else {
				console.log(`a group sent this message`)
				this.groupmute[i] = "Unuted"
			}
			
			this.setVariableValues({ [mutestring]: "Unmuted" });
			this.setVariableValues({ [anotherstring]: "Muted" });
			console.log(`Flex Channel ${i} is:  ${this.getVariableValue(mutestring) }`);
		}
		this.checkFeedbacks('flexmutestatus');
		//this.checkFeedbacks(mutestring);
		//console.log(`Flex Mute channel ${i} is ${args}`);
    }

	

}

runEntrypoint(ModuleInstance, UpgradeScripts)
