var Immutable = require('immutable');
var React = require('react');
var extend = require('extend');

/**
 Filter block to only highlight code blocks

 @param {Draft.ContentBlock} block
 @return {Boolean}
 */
function defaultFilter(block) {
    return block.getType() === 'code-block';
}

/**
 Return syntax for highlighting a code block

 @param {Draft.ContentBlock} block
 @return {String}
 */
function defaultGetSyntax(block) {
    if (block.getData) {
        return block.getData().syntax;
    }

    return null;
}

/**
 Default render for token

 @param {Object} props
 @return {React.Element}
 */
function defaultRender(props) {
    props = extend({}, props, {
        className: 'prism-token token ' + props.type
    });

    const content = props.caret ? [<span key='caret' data-caret={props.caret}
                                         className="caret"/>, ...props.children] : props.children;
    delete props.caret;
    delete props.contentState;
    delete props.decoratedText;
    delete props.entityKey;
    delete props.offsetKey;

    return React.createElement(
        "span",
        props,
        content
    );
}

const PrismOptions = Immutable.Record({
    // Default language to use
    defaultSyntax:      null,

    // Filter block before highlighting
    filter:             defaultFilter,

    // Function to get syntax for a block
    getSyntax:          defaultGetSyntax,

    // Render a decorated text for a token
    render:             defaultRender
});

module.exports = PrismOptions;
