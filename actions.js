module.exports = function (self) {
	self.setActionDefinitions({
		flex_mute: {
			name: 'Flex Channel mute',
			options: [
				{
					id: 'flexchnl_mute',
					type: 'number',
					label: 'Flex Channel',
					default: 5,
					min: 1,
					max: 17,
				},
			],
			/*callback: async (event) => {
				console.log('Hello world!', event.options.flexchnl_mute)
			},*/
		},
	})
}
