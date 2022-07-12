import React from "react";
import Axios from "axios";
import * as d3Scale from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { select as d3Select } from "d3-selection";
import { geoKavrayskiy7 } from "d3-geo-projection";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import WorldMap from "./WorldMap";
import { NEARBY_SATELLITE, STARLINK_CATEGORY, SAT_API_KEY } from "../constant";
import { SATELLITE_POSITION_URL } from "../constant";

const width = 960;
const height = 600;

class Main extends React.Component {
    constructor() {
        super();
        this.state = {
            setting: undefined,
            loadingSatellites: false,
            selected: [],
            loadingSatPositions: false,
        }
        this.refTrack = React.createRef();
    }

    showNearbySatellite = (setting) => {
        this.setState({
            setting: setting,
        });
        this.fetchSatellite(setting);
    }

    fetchSatellite = (setting) => {
        const { observerLat, observerLong, observerAlt, radius } = setting;
        const url = `${NEARBY_SATELLITE}/${observerLat}/${observerLong}/${observerAlt}/${radius}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;

        this.setState({
            loadingSatellites: true,
        });

        Axios.get(url)
            .then(response => {
                this.setState({
                    satInfo: response.data,
                    loadingSatellites: false,
                    selected: [],
                })
            })
            .catch(error => {
                console.log("err in fecth satellite -> ", error);
                this.setState({
                    loadingSatellites: false,
                })
            })
    }

    addOrRemove = (item, status) => {
        let list = this.state.selected;
        const found = list.some(entry => entry.satid === item.satid);

        // add the item that is checked
        if (status && !found) {
            list.push(item);
        }

        // remove the item that is unchecked
        if (!status && found) {
            list = list.filter(entry => {
                return entry.satid !== item.satid;
            });
        }

        this.setState({
            selected: list,
        })
    }

    trackOnClick = (duration) => {
        const { observerLat, observerLong, observerAlt } = this.state.setting;
        const endTime = duration * 60; // 每秒顯示衛星移動60秒的軌跡

        this.setState({ 
            loadingSatPositions: true,
            duration: duration,
        });

        // call API for each selected satellite
        const urls = this.state.selected.map(sat => {
            const { satid } = sat;
            const url = `${SATELLITE_POSITION_URL}/${satid}/${observerLat}/${observerLong
                }/${observerAlt}/${endTime}/&apiKey=${SAT_API_KEY}`;
            return Axios.get(url);
        });

        Axios.all(urls)
            .then(
                Axios.spread((...args) => {
                    return args.map(item => item.data);
                })
            ).then(res => {
                this.setState({
                    satPositions: res,
                    loadingSatPositions: false,
                });
                this.track();
            })
            .catch(e => {
                console.log("err in fetch satellite position -> ", e.message);
            })
    }

    track = () => {
        const data = this.state.satPositions;
        const len = data[0].positions.length;
        const duration = this.state.duration;

        const canvas2 = d3Select(this.refTrack.current)
            .attr("width", width)
            .attr("height", height);

        const context2 = canvas2.node().getContext("2d");

        let now = new Date();
        let i = duration;

        let timer = setInterval(() => {
            let timePassed = Date.now() - now;
            if (i === duration) {
                now.setSeconds(now.getSeconds() + duration * 60)
            }

            let time = new Date(now.getTime() + 60 * timePassed);
            context2.clearRect(0, 0, width, height);
            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);

            if (i >= len) {
                clearInterval(timer);
                this.setState({ isDrawing: false });
                return;
            }

            data.forEach(sat => {
                const { info, positions } = sat;
                this.drawSat(info, positions[i], context2)
            });

            i += 60;
        }, 1000)
    }

    drawSat = (sat, pos, context2) => {
        const { satlongitude, satlatitude } = pos;
        if (!satlongitude || !satlatitude) return;
        const { satname } = sat;
        const nameWithNumber = satname.match(/\d+/g).join("");
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1);
        
        const xy = projection([satlongitude, satlatitude]);
        context2.fillStyle = d3Scale.scaleOrdinal(schemeCategory10)(nameWithNumber);
        context2.beginPath();
        context2.arc(xy[0], xy[1], 4, 0, 2*Math.PI);
        context2.fill();
        context2.font = "bold 11px sans-serif";
        context2.textAlign = "center";
        context2.fillText(nameWithNumber, xy[0], xy[1]+14);
    }

    render() {
        return (
            <div className="main">
                <div className="left-side">
                    <SatSetting onShow={this.showNearbySatellite} />
                    <SatelliteList
                        satInfo={this.state.satInfo}
                        loading={this.state.loadingSatellites}
                        onSelectionChange={this.addOrRemove}
                        disableTrack={this.state.selected.length === 0}
                        trackOnClick={this.trackOnClick} />
                </div>
                <div className="right-side">
                    <WorldMap
                        loading={this.state.loadingSatPositions}
                        refTrack={this.refTrack}
                    />
                </div>
            </div>
        );
    }
}

export default Main;