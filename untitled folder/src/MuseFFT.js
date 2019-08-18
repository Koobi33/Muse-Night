import React, {Component} from 'react';
import { zipSamples, MuseClient } from 'muse-js';
import { powerByBand, epoch, fft } from "@neurosity/pipes";
import { VictoryLine, VictoryChart, VictoryAxis,
    VictoryZoomContainer, VictoryBrushContainer } from 'victory';

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

export class MuseFFT extends Component {

    state = {
        iterator: 0,
        status: 'Disconnected',
        button_disabled: false,
        zoomDomain: {x: [new Date().getSeconds(), new Date().getSeconds() + 1]},
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
        return (
            <div className='MuseFFT'>
                <button disabled={this.state.button_disabled} onClick={this.connect}>Connect Muse Headband</button>
                <button disabled={!this.state.button_disabled} onClick={this.stop}>Stop Muse Headband</button>
                <p>{this.state.status}</p>
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
                    let time = new Date();
                    this.setState(state => {
                        let obj = {
                            beta: this.normalize([data.beta[0], data.beta[1], data.beta[2], data.beta[3]]),
                            time: new Date(time).toLocaleString('ru', {
                                minute: '2-digit',
                                second: '2-digit'
                            })

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
