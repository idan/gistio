function Injector(options) {

	/**
	 * Local variables
	 */
	var containerNode;
	var currentNode;
	var scripts = [];

	/**
	 * Check config and set up local variables.
	 */
	var init = function() {
		options = mergeProperties(options || {}, {
			'container': document.body,
			'sibling': null
		});

		containerNode = options.container;
		currentNode = options.sibling;
	};

	/**
	 * Merge properties of two objects and return a new combined object.
	 */
	var mergeProperties = function(options, defaults) {
		var combined = {};
		for (var name in defaults) {
			if (!defaults.hasOwnProperty(name)) {
				continue;
			} else if (typeof options[name] == 'undefined') {
				combined[name] = defaults[name];
			} else {
				combined[name] = options[name];
			}
		}
		return combined;
	};

	/**
	 * Fire onload events.
	 */
	var fireLoadEvents = function() {
		var load;
		if (document.createEvent) {
			load = document.createEvent('HTMLEvents');
			load.initEvent('load', false, true);
			window.dispatchEvent(load);
		} else if (document.createEventObject) {
			load = document.createEventObject();
			document.body.fireEvent('onload', load);
		}
	};

	/**
	 * Replaces document.write
	 */
	var documentWrite = function(html) {
		appendHtml(html);
	};

	/**
	 * Create temporary node and inject HTML.
	 */
	var createTemp = function(html) {
		var temp = document.createElement('div');

		if (typeof html == 'object' && html.parentNode) {
			temp.appendChild(html);
		} else if (typeof html == 'object' && html.length) {
			while (html.length) {
				temp.appendChild(html[0]);
			}
		} else {
			//IE7 refuses to work with all empty nodes. Ensure the
			//first node has text, then remove it.
			temp.innerHTML = '<span>.</span>' + html;
			temp.removeChild(temp.childNodes[0]);
		}

		return temp;
	};

	/**
	 * Append HTML at current position.
	 */
	var appendHtml = function(html) {
		var temp = createTemp(html);

		replaceScripts(temp);

		var nodes = temp.childNodes;
		while (nodes.length) {
			appendNode(nodes[0]);
		}
	};

	/**
	 * Append a node at current position.
	 *
	 * Called by appendHtml()
	 */
	var appendNode = function(node) {
		if (currentNode) {
			currentNode.parentNode.insertBefore(node, currentNode.nextSibling);
		} else {
			containerNode.appendChild(node);
		}
		currentNode = node;
	};

	/**
	 * Remove all script children and replace with placeholders.
	 *
	 * Keep list of replaced nodes in `scripts` variable.
	 */
	var replaceScripts = function(node) {
		var nodes = node.getElementsByTagName('script');

		// We want new scripts to load in order, but before other scripts.
		// Iterate backwards and push onto front of scripts array.
		for (var i = nodes.length - 1; i >= 0; i--) {
			(function() {
				var node = nodes[i];
				var placeholder = document.createComment('Script placeholder');

				node.parentNode.insertBefore(placeholder, node);
				node.parentNode.removeChild(node);

				scripts.unshift({
					placeholder: placeholder,
					node: node
				});
			})();
		}
	};

	/**
	 * Append script nodes after their placeholders.
	 *
	 * Called after all other functions, before we return to client code.
	 */
	var restoreScripts = function(scripts, complete) {

		var restoreScript = function() {
			if (scripts.length) {
				var script = scripts.shift();
				currentNode = script.placeholder;

				// External or inline script?
				if (script.node.src) {
					var node = document.createElement('script');
					node.type = 'text/javascript';
					node.src = script.node.src;
				    addScriptListeners(node, restoreScript);
				    script.placeholder.parentNode.insertBefore(node, script.placeholder);
				} else if (script.node.innerHTML) {
					evalInline(script.node.innerHTML);
					restoreScript();
				} else {
					restoreScript();
				}
			} else {
				complete();
			}
		};

		restoreScript();
	};

	/**
	 * Listen for onload or onerror events.
	 */
	var addScriptListeners = function(node, func) {
		if (node.addEventListener) {
			node.addEventListener('error', func, true);
			node.addEventListener('load', func, true);
		} else if (node.attachEvent) {
			node.attachEvent('onerror', func, true);
			node.attachEvent('onload', func, true);
			node.attachEvent('onreadystatechange', function() {
				if (node.readyState == 'complete' || node.readyState == 'loaded') {
					func();
				}
			});
		} else {
			throw Error("Failed to attach listeners to script.");
		}
	};


	/**
	 * Evaluate JS snippet.
	 */
	var evalInline = function(script) {
		try {
			eval(script);
		} catch (e) {
			// Don't propagate up the stack
		}
	};

	/**
	 * Wrap DOM modifying function that is being exposed externally.
	 *
	 * This makes sure that while we are internal functions, document.write is
	 * remapped.
	 */
	var expose = function(func) {
		return function() {
			var self = this;
			var temp = document.write;

			document.write = documentWrite;
			func.apply(this, arguments);

			restoreScripts(scripts, function() {
				document.write = temp;
				self.oncomplete.call();
			});
		};
	};

	/**
	 * Callback
	 */
	this.oncomplete = function() {

	};

	/**
	 * Evaluate JS code in the current position.
	 */
	this.eval = expose(function(script) {
		evalInline(script);
	});

	/**
	 * Insert HTML into container.
	 */
	this.insert = expose(function(html) {
		appendHtml(html);
	});

	/**
	 * Set our current node scripts should execute in the context of.
	 */
	this.setContainer = function(container) {
		if (container) {
			containerNode = container;
		}
	};

	/**
	 * Set the sibling node scripts should be run AFTER.
	 */
	this.setSibling = function(sibling) {
		if (sibling) {
			currentNode = sibling;
			containerNode = sibling.parentNode;
		}
	};

	init();
}
