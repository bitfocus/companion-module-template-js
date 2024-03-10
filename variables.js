

	/**
	 * INTERNAL: Get the available feedbacks.
	 *
	 * @returns {Object[]} the available feedbacks
	 * @access protected
	 * @since 1.0.0
	 */
	export function getVariables() {
		//var self = this
		const variables = []
		

		
		
		for (let i = 0; i < 33; i++) {
			let newname = "flex_channel" + i +"status"
			//console.log(newname);

			variables.push({
				name: `Flex Channel ` + i +  ` Mute Status`,
				//variableId: [newname],
				variableId: "flex_channel" + i + "status",
			})


			this.setVariableValues({ [newname]: "init" });
			//this.setVariableValues({ [anotherstring]: "Unmuted" });
			console.log(`variable ${[newname]} value:  ${this.getVariableValue([newname])}`);
		}
		

		for (let i = 0; i < 17; i++) {
			var newname = "group" + i +"status"


			variables.push({
				name: 'Group Mute ' + i + 'Status',
				variableId: "group" +i + "status",
			})


			this.setVariableValues({ [newname]: "init"});
			
		}
		for (let i = 0; i < 9; i++) {
			var newname = "MtxMaster" + i + "status"


			variables.push({
				name: 'MtxMaster Mute ' + i + 'Status',
				variableId: "MtxMasterMute" + i + "status",
			})


			this.setVariableValues({ [newname]: "init" });

		}
		
		variables.push({
			label: "My Variable",
			variableId: "myvar"
		})
		this.setVariableValues({ myvar: "this sucks", });

		return variables;
}
export function setAllVariables() {
	for (let i = 0; i < 33; i++) {
		let setvar = "flexmute" + i + "status"
		this.setVariableValues({ [setvar]: " " });
	}
}


