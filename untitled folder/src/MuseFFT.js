import React, {Component} from 'react';
import { zipSamples, MuseClient } from 'muse-js';
import { powerByBand, epoch, fft } from "@neurosity/pipes";
import { VictoryLine, VictoryChart, VictoryAxis,
    VictoryZoomContainer, VictoryBrushContainer } from 'victory';
import YouTube from 'react-youtube';

import './MuseFFT.css';

const chartSectionStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  padding: '20px'
};

let finalData = [{
    time: 0,
    beta: 2
}];

let time = 0;
export class MuseFFT extends Component {

    state = {
        iterator: 0,
        status: 'Disconnected',
        button_disabled: false,
        zoomDomain: {x: [new Date().getSeconds(), new Date().getSeconds() + 1]},
        videoID: 'A36LahZNUiE',
    };

    handleZoom(domain) {
        this.setState({zoomDomain: domain});
    }

    normalize = (data) => {
        let sorted = data.sort((a, b) => a - b);
        return (Math.pow((sorted[0] / sorted[3] +
            sorted[1] / sorted[3] +
            sorted[2] / sorted[3]
        ), 2))

    };

    render() {
        const opts = {
            height: '390',
            width: '640',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1
            }};
        return (
            <div className='MuseFFT'>
                <button disabled={this.state.button_disabled} onClick={this.connect}>Connect Muse Headband</button>
                <button disabled={!this.state.button_disabled} onClick={this.stop}>Stop Muse Headband</button>
                <p>{this.state.status}</p>
                <input style={{ width: '400px', height: '20px', backgroundColor: 'pink', margin: '100px'}} value={this.state.videoID} onChange={(e)=> {this.setState({videoID: e.target.value})}}/>
                <YouTube
                    videoId={this.state.videoID}
                    opts={opts}
                    onReady={this._onReady}
                    onPlay={event => {
                        if (this.state.status === 'Disconnected') {
                            event.target.pauseVideo();
                            this.connect().then(() => {
                                setTimeout(() => {
                                    event.target.playVideo()
                                }, 5000);
                            });
                        }
                    }}
                    onEnd={this.stop}
                />
                <div style={chartSectionStyle}>
                    <div>
                        <VictoryChart
                            padding={{top: 100, left: 250, right: 50, bottom: 30}}
                            width={1200} height={200} scale={{x: "time"}}
                            containerComponent={
                                <VictoryBrushContainer
                                    brushDimension="x"
                                    brushDomain={this.state.zoomDomain}
                                    onBrushDomainChange={this.handleZoom.bind(this)}
                                />
                            }>
                            <VictoryAxis
                                tickFormat={() => ''}
                            />
                            <VictoryLine
                                style={{
                                    data: {stroke: "tomato"}
                                }}
                                data={finalData}
                                x="time"
                                y="beta"
                            />
                        </VictoryChart>
                        <VictoryChart
                            padding={{top: 0, left: 250, right: 50, bottom: 30}} width={1200} height={300}
                            scale={{x: "time"}}
                            containerComponent={
                                <VictoryZoomContainer
                                    zoomDimension="x"
                                    zoomDomain={this.state.zoomDomain}
                                    onZoomDomainChange={this.handleZoom.bind(this)}
                                />
                            }>
                            <VictoryLine
                                style={{
                                    data: {stroke: "tomato"}
                                }}
                                data={finalData}
                                x="time"
                                y="beta"
                            />
                        </VictoryChart>
                    </div>
                </div>
            </div>
        );
    }
    _onReady(event) {
        // access to player in all event handlers via event.target
            event.target.pauseVideo();
    }
     client = new MuseClient();
    stop = async () =>  {
        await this.client.pause();
    };
    connect = async () => {

        this.client.connectionStatus.subscribe((status) => {
            this.setState({
                status: status ? 'Connected!' : 'Disconnected',
                button_disabled: status
            });
            console.log(status ? 'Connected!' : 'Disconnected');
        });
        try {
            await this.client.connect();
            await this.client.start();
            zipSamples(this.client.eegReadings).pipe(
                epoch({duration: 1024, interval: 250, samplingRate: 256}),
                fft({bins: 128}),
                powerByBand()
            ).subscribe(
                (data) => {
                    // let time = 0;
                    time += 1;
                    this.setState(state => {
                        let obj = {
                            beta: this.normalize([data.beta[0], data.beta[1], data.beta[2], data.beta[3]]),
                            time: time
                                // new Date(time).toLocaleString('ru', {
                                // minute: '2-digit',
                                // second: '2-digit'
                            // })

                        };
                        finalData.push(obj);
                        return ({finalData: state.finalData});
                    });
                }
            );
        } catch (err) {
            console.error('Connection failed', err);
        }
    }
}

export default MuseFFT;
