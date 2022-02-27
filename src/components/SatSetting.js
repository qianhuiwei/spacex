import { InputNumber, Button } from "antd";
import React from "react";

class SatSetting extends React.Component {
    constructor() {
        super();
        this.state = {
            observerLong: 0,
            observerLat: 0,
            observerAlt: 0,
            radius: 90,
        }
    }

    // event listener call back functions
    onChangeLong = (value) => {
        console.log("long value ", value);
        this.setState({
            observerLong: value,
        })
    }

    onChangeLat = (value) => {
        console.log("lat value", value);
        this.setState({
            observerLat: value,
        })
    }

    onChangeAlt = (value) => {
        console.log("alt value", value);
        this.setState({
            observerAlt: value,
        })
    }

    onChangeRadius = (value) => {
        console.log("radius value", value);
        this.setState({
            radius: value,
        })
    }

    showSatellite = () => {
        this.props.onShow(this.state);
    }

    render() {
        return (
            <div className="sat-setting">
                <div className="loc-setting">
                    <p className="setting-label">From Location</p>
                    <div className="setting-list two-item-col">
                        <div className="list-item">
                            <label>Longitude: </label>
                            <InputNumber
                                min={-180}
                                max={180}
                                defaultValue={0}
                                style={{ margin: "0 2px" }}
                                onChange={this.onChangeLong}
                            />
                        </div>
                        <div className="list-item right-item">
                            <label>Latitude: </label>
                            <InputNumber
                                min={-90}
                                max={90}
                                defaultValue={0}
                                style={{ margin: "0 2px" }}
                                onChange={this.onChangeLat}
                            />
                        </div>
                    </div>
                    <div className="setting-list">
                        <div className="list-item"></div>
                        <label>Altitude(meters): </label>
                            <InputNumber
                                min={-413}
                                max={8850}
                                defaultValue={0}
                                style={{ margin: "0 2px" }}
                                onChange={this.onChangeAlt}
                            />
                    </div>
                </div>

                <p className="setting-label">Restrictions</p>
                <div className="setting-list">
                    <div className="list-item">
                        <label>Search Radius</label>
                        <InputNumber
                                min={0}
                                max={90}
                                defaultValue={0}
                                style={{ margin: "0 2px" }}
                                onChange={this.onChangeRadius}
                            />
                    </div>
                </div>
                <div className="show-nearby">
                    <Button className="show-nearby-btn"
                            size="large"
                            onClick={this.showSatellite}>
                        Find Nearby Satellites
                    </Button>
                </div>
            </div>
        );
    }
}

export default SatSetting;