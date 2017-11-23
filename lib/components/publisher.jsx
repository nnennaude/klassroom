/* eslint-env browser */
import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import push from 'git-push';


const remote = require('electron').remote;
const app = remote.app;

const fs = remote.require('fs-extra');
const path = remote.require('path');

const stages = {
  DEFAULT: 0,
  DISPLAYED: 1,
  PUBLISHING: 2,
  COMPLETE: 3,
}

const REMOTE_HOST = 'https://github.com/nnennaude/chem_class1.git';
const JS_BUNDLE = 'folder.web.bundle.js';

class Publisher extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      stage: stages.DEFAULT,
      progress: 0,
    };

    this.saveFolderMap = this.saveFolderMap.bind(this);
    this.eachMessage = this.eachMessage.bind(this);
    this.outputMessage = this.outputMessage.bind(this);
    this.goToSite = this.goToSite.bind(this);
  }

  eachMessage(m, i){
    return <span key={i}>{m}</span>
  }

  outputMessage(msg) {
    console.log(msg);
    const messages = update(this.state.messages, { $push: [msg] });
    this.setState({messages});
  }

  saveFolderMap(e) {
    e.preventDefault();
    const outputMessage = this.outputMessage;
    const setState = this.setState;
    const folderMap = this.props.folderMap;

    this.setState({
      stage: stages.PUBLISHING,
      messages: [],
    });

    function updateProgress(progress) {
      this.setState({progress});
    }
    updateProgress = updateProgress.bind(this);

    const appPath = app.getAppPath();
    const tempPath = app.getPath('temp');
  
    const origin = path.resolve(appPath, 'app');
    const tempWebsite = path.resolve(tempPath, 'website');

    const bundleOrigin = path.resolve(appPath, `out/${JS_BUNDLE}`);
    const bundleCopy =  path.resolve(tempWebsite, `js/${JS_BUNDLE}`);

    const folderMapFileName = path.resolve(tempWebsite, 'folderMap2.json');

    fs.copy(origin, tempWebsite)
    .then(() => {
      outputMessage(`copied html to '${tempWebsite}'`);
      updateProgress(25);

      return fs.copy(bundleOrigin, bundleCopy);
    }).then(() => {
      outputMessage(`copied ${bundleOrigin} to '${bundleCopy}'`);
      updateProgress(35);
      
      
      return fs.writeJson(folderMapFileName, folderMap)
    }).then(() => {
      outputMessage(`The file was saved at '${folderMapFileName}'`);
      updateProgress(65);

      return new Promise((resolve, reject) => {
        push(tempWebsite, REMOTE_HOST, resolve);
      });
    }).then((() => {
      outputMessage(`published at ${REMOTE_HOST}`);
      this.setState({
        stage: stages.COMPLETE,
        progress: 100,
      });
    }).bind(this)).catch(err => console.error(err));
  }

  goToSite(){
    remote.shell.openExternal('https://nnennaude.github.io/chem_class1');
  }
  

  render() {
    const log = this.state.messages.join("\n");    
    const output = (this.state.stage >= stages.PUBLISHING) && (<pre className="pre-scrollable"><code>{log}</code></pre>);
    const startBtn = (this.state.stage == stages.DEFAULT) && (<button
      className="btn btn-primary btn-lg btn-block"
      href="#portfolioModal1"
      data-toggle="modal"
      onClick={this.saveFolderMap}
    >
      Start
    </button>);
    const externalLink = (this.state.stage == stages.COMPLETE) && (<button className="btn btn-success" type="button" onClick={this.goToSite}>
      <i className="fa fa-times"></i>
      View Site
    </button>);

    const progressBar = (this.state.stage >= stages.PUBLISHING) && (<div className="progress">
      <div
        className="progress-bar progress-bar-striped progress-bar-animated"
        role="progressbar"
        aria-valuenow="75"
        aria-valuemin="0" aria-valuemax="100"
        style={{width: `${this.state.progress}%`}}>
      </div>
    </div>);

    return (
    <div className="portfolio-modal modal fade" id="portfolioModalA" tabIndex="-1" role="dialog" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="close-modal" data-dismiss="modal">
            <div className="lr">
              <div className="rl"></div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <div className="modal-body">
                  <h2>Publish</h2>
                  <hr className="star-primary"/>
                  {startBtn}
                  {progressBar}
                  {output}
                  
                  {externalLink}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
   
  }
}

Publisher.propTypes = {
  folderMap: PropTypes.object.isRequired,
};

export default Publisher;