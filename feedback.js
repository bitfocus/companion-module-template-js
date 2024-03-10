import { combineRgb } from '@companion-module/base'
//import { getVariables } from './variables.js'

export function getFeedbacks(){

	/**
	 * INTERNAL: Get the available feedbacks.
	 *
	 * @returns {Object[]} the available feedbacks
	 * @access protected
	 * @since 1.0.0
	 */
	
		var self = this
		const feedbacks = {}
	    const testoptions = []
	for (let i = 0; i < 33; i++) {
		//console.log(`Starting to populate choice ${i}`);
		//let newid = "flexmute" + i
		//let newname = `Flex Mute ${i}`
		testoptions.push({
			id: `flexmute${i}`,
			label: `Flex Mute ${i}`
		});
		

	}
	
		


	

	feedbacks['flexmutestatus'] = {
		type: 'boolean',
		name: 'Mutes Feedback',
		defaultStyle: {
			// The default style change for a boolean feedback
			// The user will be able to customise these values as well as the fields that will be changed
			bgcolor: combineRgb(187, 15, 27),
			color: combineRgb(221, 205, 206),
		},
		// options is how the user can choose the condition the feedback activates for
		options: [{
			type: 'dropdown',
			label: 'Select mute:',
			choices: [{ id: 'flex_channel', label: 'Flex Channel Mute' },
				{ id: 'group', label: 'Group Mute' }, ],
			id: 'chnltype',
			default: 'flex_channel'
		},
			{
				type: 'number',
				label: 'Channel Number',
				id: 'chno',
				default: 1
			}
		],
		callback: (feedback) => {
			
			var ch = feedback.options.chno
			var chtype = feedback.options.chnltype
			console.log(`Feedback ch type:  ${chtype}`)
			
			if (feedback.options.chnltype === 'group') {
				//console.log('channel type is group')
				console.log(`${feedback.options.chnltype} channel ${ch} is ${this.groupmute[ch]}`)

				if (this.groupmute[ch] == 'Muted') {
					return true;
					//console.log('feedback returned true')
				} else {
					return false;
					//console.log('feedback returned false')
				}
			}
			if (feedback.options.chnltype === 'flex_channel') {
				//console.log('channel type is flex channel')
				console.log(`${feedback.options.chnltype} channel ${ch} is ${this.flexmute[ch]}`)
				if (this.flexmute[ch] == 'Muted') {
					return true;
					console.log('feedback returned true')
				} else {
					return false;
					console.log('feedback returned false')

				}

			}
		}
			
		
	}

	feedbacks['groupfadestatus'] = {


		type: 'boolean',
		name: 'Group Fade Feedback',
		defaultStyle: {
			// The default style change for a boolean feedback
			// The user will be able to customise these values as well as the fields that will be changed
			bgcolor: combineRgb(27, 126, 155),
			color: combineRgb(0, 0, 0),
		},
		// options is how the user can choose the condition the feedback activates for
		options: [
		{
			type: 'number',
			label: 'Group Number',
			id: 'grpfadno',
			default: 1,
		}
		],
		callback: (feedback) => {
			console.log(feedback);
			var ch = feedback.options.grpfadno
			console.log(`feedback group channel is ${ch}`);
			if (this.groupfade[ch] === "in") {
				return false;
			} else {
				return true;
            }


			console.log(`the feedback channel number is:  ${feedback.options.chno}`)
			var ch = feedback.options.grpfadno
			
			
		}

    }
		
		return feedbacks;
}

	// Condenses feedback options to an object containing id and default value alone for all feedback options
	/*getFeedbackDefaults(feedbackType) {
		var self = this
		return self.getFeedbacks()[feedbackType].options.map(e => [e.id, e.default]).reduce(function (p, c) {
			p[c[0]] = c[1];
			return p;
		}, {})
	}
}// JavaScript source code*/
