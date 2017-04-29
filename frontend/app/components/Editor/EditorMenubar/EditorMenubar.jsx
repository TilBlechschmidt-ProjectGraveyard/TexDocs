import React, {Component, PropTypes} from "react";
import {Map} from "immutable";
import {connect} from "react-redux";
import {FlatButton} from "material-ui";
import Icon from "material-ui/svg-icons/action/list";
import Share from 'material-ui/svg-icons/social/share';
import ExpandMore from 'material-ui/svg-icons/navigation/arrow-drop-down';
import {fullWhite} from 'material-ui/styles/colors';


import "./EditorMenubar.css";
import EditorMenubarControls from "./EditorMenubarControls/EditorMenubarControls";
import {Link} from "react-router-dom";
import {changeFileName, shareFile} from "../../../api/google";
import {NAME_SAVE_DELAY} from "../../../const";

const TexDocsButton = () =>
    <Link to="/" className="tex-docs-button">
        <Icon color='white' style={{width: '60%', height: '100%'}}/>
    </Link>;

class EditorMenubar extends Component {
    constructor(args) {
        super(args);

        this.state = {
            name: ""
        };
    }

    componentDidUpdate(prevProps) {
        const prevMeta = prevProps.files.get('metadata');
        const meta = this.props.files.get('metadata');
        if (prevMeta && meta && prevMeta.name !== meta.name || !prevMeta && meta && meta.name)
            this.setState({ name: this.props.files.get('metadata').name });
    }

    share = () => {
        shareFile(
            this.props.googleAPI.get('api').share,
            this.props.googleAPI.get('accessToken'),
            this.props.files.get('metadata').id
        );
    };

    documentNameChange = (e) => {
        const newName = e.target.value;
        this.setState({ name: newName });
        if (this.nameTimeout) clearTimeout(this.nameTimeout);
        this.nameTimeout = setTimeout(() => {
            console.log('SAVING NAME', newName);
            const driveAPI = this.props.googleAPI.get('api').drive;
            console.log(driveAPI);
            changeFileName(driveAPI, this.props.files.get('metadata').id, newName).then();
        }, NAME_SAVE_DELAY);
    };

    render() {
        const document = this.props.files.get('document');
        const metadata = this.props.files.get('metadata');

        const user = this.props.googleAPI.get('user');

        const ids = [];
        const collaborators = document ? document.getCollaborators().filter((collaborator) => {
            for (let id in ids)
                if (ids.hasOwnProperty(id) && ids[id] === collaborator.userId) return false;
            ids.push(collaborator.userId);
            return true;
        }) : [];

        return (
            <div className={this.props.collapsed ? "menubar collapsed" : "menubar"}>
                <TexDocsButton/>
                <div className="container">
                    <div>
                        <div>
                            <input
                                className="menubar-title"
                                value={this.state.name}
                                onChange={this.documentNameChange}
                            />
                        </div>
                        <div className="puush"/>
                    </div>
                    <div>
                        <div className="puush"/>
                        <div className="menubar-bottom">
                            <EditorMenubarControls/>
                        </div>
                    </div>
                </div>
                <div className="container" style={{marginLeft: 'auto'}}>
                    <div>
                        {user ? <FlatButton
                            label={user.get('email')}
                            labelPosition="before"
                            labelStyle={{textTransform: 'lowercase', fontSize: 10}}
                            style={{height: '20px', lineHeight: '20px'}}
                            icon={<ExpandMore />}
                        /> : undefined}
                        <div className="puush" />
                    </div>
                    <div style={{justifyContent: 'flex-end', flexDirection: 'row', marginBottom: 5, marginRight: 24}}>
                        <div className="puush"/>
                        <div className="menubar-collaborators">
                            {collaborators.map((collaborator) => {
                                if (!collaborator.isMe)
                                    return <div className="collaborator" key={collaborator.sessionId} >
                                        <div className="crop">
                                            <img src={collaborator.photoUrl}/>
                                        </div>
                                        <div className="color-bar" style={{backgroundColor: collaborator.color}}/>
                                    </div>;
                            })}
                        </div>
                        <FlatButton
                            backgroundColor="#4D90FE"
                            hoverColor="#42A5F5"
                            icon={<Share color={fullWhite} />}
                            labelStyle={{fontSize: 13}}
                            style={{height: '29px', lineHeight: '29px', minWidth: '78px', color: fullWhite, whiteSpace: 'nowrap', display: 'inline-block'}}
                            label="Share"
                            onTouchTap={this.share}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

EditorMenubar.propTypes = {
    files: PropTypes.instanceOf(Map).isRequired,
    googleAPI: PropTypes.instanceOf(Map).isRequired
};

export default connect(
    (state) => {
        return {
            files: state.editor.files,
            googleAPI: state.googleAPI
        }
    }
)(EditorMenubar);
