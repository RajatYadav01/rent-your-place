import { useContext } from "react";
import { LoginSuccessStatusContext } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";
import "../dist/css/Filter.css";

type FilterPropsType = {
    setCountryFilter: (newState: string) => void;
    setPlaceFilter: (newState: string) => void;
    setMinimumAreaFilter: (newState: typeof NaN | number) => void;
    setMaximumAreaFilter: (newState: typeof NaN | number) => void;
    setNumberOfBedroomsFilter: (newState: typeof NaN | number) => void;
    setNumberOfBathroomsFilter: (newState: typeof NaN | number) => void;
    setNearbyLandmarkFilter: (newState: string) => void;
    setMinimumMonthlyRentFilter: (newState: number) => void;
    setMaximumMonthlyRentFilter: (newState: number) => void;
    currencyUnitFilter: string;
    setCurrencyUnitFilter: (newState: string) => void;
    ownerPropertiesOnlyFilter: boolean;
    handleUserPropertiesCheckbox: () => void;
    likedPropertiesOnlyFilter: boolean;
    handleLikedPropertiesCheckbox: () => void;
}

function Filter(props: FilterPropsType) {
    const loginSuccessStatusContext = useContext(LoginSuccessStatusContext);

    return (
        <div className="filter-container">
            <div className="filter-container__main-filters">
                <h2 className="filter-container__heading">Filters</h2>
                <div className="filter-container__country">
                    <label className="filter-container__label">Country</label>
                    <input className="filter-container__search" type="text" placeholder="Search by country" onChange={(event) => props.setCountryFilter(event.target.value)} aria-label="Filter properties by country"></input>
                </div>
                <div className="filter-container__place">
                    <label className="filter-container__label">Place</label>
                    <input className="filter-container__search" type="text" placeholder="Search by place" onChange={(event) => props.setPlaceFilter(event.target.value)} aria-label="Filter properties by place"></input>
                </div>
                <div className="filter-container__area">
                    <label className="filter-container__label">Area (in sq. ft.)</label>
                    <div className="filter-container__area-search-container">
                        <input className="filter-container__area-search" type="number" placeholder="Minimum area" onChange={(event) => props.setMinimumAreaFilter(parseInt(event.target.value))} aria-label="Filter properties by minimum area required"></input>
                        <span className="filter-container__separator">-</span>
                        <input className="filter-container__area-search" type="number" placeholder="Maximum area" onChange={(event) => props.setMaximumAreaFilter(parseInt(event.target.value))} aria-label="Filter properties by maximum area required"></input>
                    </div>
                </div>
                <div className="filter-container__number-of-bedrooms">
                    <label className="filter-container__label">Number of bedrooms</label>
                    <input className="filter-container__search" type="number" placeholder="Search by number of bedrooms" onChange={(event) => props.setNumberOfBedroomsFilter(parseInt(event.target.value))} aria-label="Filter properties by number of bedrooms"></input>
                </div>
                <div className="filter-container__number-of-bathrooms">
                    <label className="filter-container__label">Number of bathrooms</label>
                    <input className="filter-container__search" type="number" placeholder="Search by number of bathrooms" onChange={(event) => props.setNumberOfBathroomsFilter(parseInt(event.target.value))} aria-label="Filter properties by number of bathrooms"></input>
                </div>
                <div className="filter-container__nearby-landmark">
                    <label className="filter-container__label">Nearby landmark</label>
                    <input className="filter-container__search" type="text" placeholder="Search by nearby landmark" onChange={(event) => props.setNearbyLandmarkFilter(event.target.value)} aria-label="Filter properties by nearby landmark"></input>
                </div>
                <div className="filter-container__rent-and-currency-unit-container">
                    <div className="filter-container__rent">
                        <label className="filter-container__label">Rent</label>
                        <div className="filter-container__rent-search-container">
                            <input className="filter-container__rent-search" type="number" placeholder="Minimum rent" onChange={(event) => props.setMinimumMonthlyRentFilter(parseInt(event.target.value))} aria-label="Filter properties by minimum monthly rent"></input>
                            <span className="filter-container__separator">-</span>
                            <input className="filter-container__rent-search" type="number" placeholder="Maximum rent" onChange={(event) => props.setMaximumMonthlyRentFilter(parseInt(event.target.value))} aria-label="Filter properties by maximum monthly rent"></input>
                        </div>
                    </div>
                    <select 
                        id="filter-container__currency-unit" 
                        className="filter-container__currency-unit" 
                        lang="en" 
                        name="currencyUnitFilter" 
                        onChange={(event) => props.setCurrencyUnitFilter(event.target.value)} 
                        value={props.currencyUnitFilter}
                        autoComplete="off">
                            <option value="">Select a currency unit</option>
                            <option value="INR">INR</option>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                    </select>
                </div>
            </div>
            <div className="filter-container__other-filters">
                {loginSuccessStatusContext.loginStatusState.loginUserType === "owner" && <div className="filter-container__user-properties">
                    <input className="filter-container__user-properties-checkbox" type="checkbox" name="userPropertiesCheckbox" checked={props.ownerPropertiesOnlyFilter} onChange={props.handleUserPropertiesCheckbox}/>
                    <label className="filter-container__user-properties-label" htmlFor="filter-container__user-properties-checkbox">View only properties added by you</label>
                </div>}
                {(loginSuccessStatusContext.loginStatusState.loginUserType === "owner" || loginSuccessStatusContext.loginStatusState.loginUserType === "tenant") && <div className="filter-container__liked-properties">
                    <input className="filter-container__liked-properties-checkbox" type="checkbox" name="likedPropertiesCheckbox" checked={props.likedPropertiesOnlyFilter} onChange={props.handleLikedPropertiesCheckbox}/>
                    <label className="filter-container__liked-properties-label" htmlFor="filter-container__liked-properties-checkbox">View only your favourite properties</label>
                </div>}
            </div>
        </div>
    );
}

export default Filter;