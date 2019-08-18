import React, {useEffect, useState} from 'react';
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


const MuseFFT = () => {
    const [status, setStatus] = useState('Disconnected');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [zoomDomain, setZoomDomain] = useState({x: [0, 5]});
    const [finalData, setFinalData] = useState(
        [{
            time: new Date(),
            beta: 0
        }]);

    const connect = async () => {
        const client = new MuseClient();
        client.connectionStatus.subscribe((status) => {
            setStatus(status ? 'Connected!' : 'Disconnected');
            setButtonDisabled(status);
            console.log(status ? 'Connected!' : 'Disconnected');
        });
        try {
            await client.connect();
            await client.start();
            zipSamples(client.eegReadings).pipe(
                epoch({duration: 1024, interval: 100, samplingRate: 256}),
                fft({bins: 128}),
                powerByBand()
            ).subscribe(
                (data) => {
                    let obj = {
                        beta: normalize([data.beta[0], data.beta[1], data.beta[2], data.beta[3]]),
                        time: new Date()
                    };
                    setFinalData(() => finalData.concat(obj));
                });
        } catch (err) {
            console.error('Connection failed', err);
        }
    };
    const handleZoom = domain => setZoomDomain(domain);
    const normalize = (data) => {
        let sorted = data.sort((a, b) => a - b);
        return (Math.pow((sorted[0] / sorted[3] +
            sorted[1] / sorted[3] +
            sorted[2] / sorted[3]
        ), 2))

    };
    return (
        <div className='MuseFFT'>
            <button disabled={buttonDisabled} onClick={connect}>Connect Muse Headband</button>
            <p>{status}</p>
            <div style={chartSectionStyle}>
                <div>
                    <VictoryChart
                        padding={{top: 100, left: 250, right: 50, bottom: 30}} width={1200} height={800}
                        scale={{x: "time"}}
                        containerComponent={
                            <VictoryZoomContainer
                                zoomDimension="x"
                                zoomDomain={zoomDomain}
                                onZoomDomainChange={handleZoom}
                            />
                        }
                    >
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
                        padding={{top: 0, left: 250, right: 50, bottom: 30}}
                        width={1200} height={100} scale={{x: "time"}}
                        containerComponent={
                            <VictoryBrushContainer
                                brushDimension="x"
                                brushDomain={zoomDomain}
                                onBrushDomainChange={handleZoom}
                            />
                        }
                    >
                        <VictoryAxis
                            tickFormat={(x) => new Date(x).getSeconds()}
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
                </div>
            </div>
        </div>
    );
};
export default MuseFFT;