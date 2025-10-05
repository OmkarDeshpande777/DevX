import requests
import pandas as pd
import os
from typing import List, Dict

# API Configuration
API_KEY = os.getenv("DATA_GOV_IN_API_KEY", "579b464db66ec23bdd000001d95846ba7b1c4e00629f24a2800493a7")
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = "https://api.data.gov.in/resource/{}"


def fetch_all_data(limit: int = 1000) -> pd.DataFrame:
    """
    Fetch all available data from the API.
    Returns a DataFrame with all records.
    """
    url = BASE_URL.format(RESOURCE_ID)
    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": limit
    }
    
    try:
        print("⏳ Fetching data from API...")
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        records = data.get("records", [])
        
        if not records:
            print("⚠️ No records found in API response")
            return pd.DataFrame()
        
        df = pd.DataFrame(records)
        print(f"✅ Successfully fetched {len(df)} records")
        return df
    
    except requests.exceptions.Timeout:
        print("⏱️ Request timed out. Please try again.")
        return pd.DataFrame()
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        return pd.DataFrame()
    except Exception as e:
        print(f"❌ Error: {e}")
        return pd.DataFrame()


def get_unique_values(df: pd.DataFrame, column: str) -> List[str]:
    """Get sorted unique values from a column."""
    if column not in df.columns:
        return []
    return sorted(df[column].dropna().unique().tolist())


def filter_data(df: pd.DataFrame, filters: Dict) -> pd.DataFrame:
    """Apply filters to the DataFrame."""
    filtered_df = df.copy()
    for column, value in filters.items():
        if value and column in filtered_df.columns:
            filtered_df = filtered_df[filtered_df[column].str.lower() == value.lower()]
    return filtered_df


def display_options(options: List[str], title: str) -> None:
    """Display options in a formatted way."""
    print(f"\n{'='*70}")
    print(f"{title}")
    print(f"{'='*70}")
    
    # Display in 3 columns
    for i in range(0, len(options), 3):
        row = options[i:i+3]
        print("  " + " | ".join(f"{idx+i+1:3d}. {opt:<20}" for idx, opt in enumerate(row)))
    print(f"{'='*70}")


def select_from_list(options: List[str], prompt: str) -> str:
    """Let user select from a list of options."""
    if not options:
        print("❌ No options available")
        return ""
    
    if len(options) == 1:
        print(f"✅ Auto-selecting the only option: {options[0]}")
        return options[0]
    
    display_options(options, prompt)
    
    while True:
        choice = input(f"\n👉 Enter number (1-{len(options)}) or type name: ").strip()
        
        # Check if input is a number
        if choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(options):
                return options[idx]
            else:
                print(f"❌ Invalid number. Please enter 1-{len(options)}")
        else:
            # Try to match by name (case-insensitive)
            matches = [opt for opt in options if choice.lower() in opt.lower()]
            if len(matches) == 1:
                return matches[0]
            elif len(matches) > 1:
                print(f"⚠️ Multiple matches found: {', '.join(matches)}")
                print("Please be more specific or use the number.")
            else:
                print("❌ No match found. Please try again.")


def display_results(df: pd.DataFrame, commodity: str) -> None:
    """Display filtered results."""
    if df.empty:
        print("\n❌ No results to display")
        return
    
    print(f"\n{'='*100}")
    print(f"📊 RESULTS FOR: {commodity}")
    print(f"{'='*100}")
    
    # Select and display relevant columns
    display_cols = ['commodity', 'state', 'district', 'market', 
                   'modal_price', 'min_price', 'max_price', 'arrival_date']
    available_cols = [col for col in display_cols if col in df.columns]
    
    if available_cols:
        print(df[available_cols].to_string(index=False))
    else:
        print(df.to_string(index=False))
    
    print(f"{'='*100}")
    print(f"Total Records: {len(df)}")
    
    # Calculate price statistics
    if 'modal_price' in df.columns:
        try:
            df['modal_price_num'] = pd.to_numeric(df['modal_price'], errors='coerce')
            df['min_price_num'] = pd.to_numeric(df['min_price'], errors='coerce')
            df['max_price_num'] = pd.to_numeric(df['max_price'], errors='coerce')
            
            print(f"\n📈 PRICE STATISTICS:")
            print(f"   Average Modal Price: ₹{df['modal_price_num'].mean():.2f}")
            print(f"   Median Modal Price:  ₹{df['modal_price_num'].median():.2f}")
            print(f"   Lowest Min Price:    ₹{df['min_price_num'].min():.2f}")
            print(f"   Highest Max Price:   ₹{df['max_price_num'].max():.2f}")
        except Exception as e:
            print(f"⚠️ Could not calculate statistics: {e}")
    
    print(f"{'='*100}\n")


def main():
    """Main function with cascading selection."""
    print("="*70)
    print("🌾 COMMODITY PRICE FINDER - INDIA")
    print("="*70)
    print("Powered by data.gov.in API")
    print("="*70 + "\n")
    
    # Step 1: Fetch all data
    all_data = fetch_all_data(limit=1000)
    
    if all_data.empty:
        print("❌ Could not fetch data. Please try again later.")
        return
    
    # Step 2: Select State
    states = get_unique_values(all_data, 'state')
    state = select_from_list(states, "📍 AVAILABLE STATES")
    
    if not state:
        return
    
    # Step 3: Filter by state and select District
    state_data = filter_data(all_data, {'state': state})
    districts = get_unique_values(state_data, 'district')
    district = select_from_list(districts, f"📍 DISTRICTS IN {state.upper()}")
    
    if not district:
        return
    
    # Step 4: Filter by district and select Market
    district_data = filter_data(state_data, {'district': district})
    markets = get_unique_values(district_data, 'market')
    market = select_from_list(markets, f"🏪 MARKETS IN {district.upper()}")
    
    if not market:
        return
    
    # Step 5: Filter by market and select Commodity
    market_data = filter_data(district_data, {'market': market})
    commodities = get_unique_values(market_data, 'commodity')
    commodity = select_from_list(commodities, f"🌾 COMMODITIES IN {market.upper()}")
    
    if not commodity:
        return
    
    # Step 6: Get final filtered data
    print(f"\n🔍 Fetching data for: {commodity} in {market}, {district}, {state}")
    print("⏳ Processing...\n")
    
    final_data = filter_data(market_data, {'commodity': commodity})
    
    # Step 7: Display results
    if not final_data.empty:
        display_results(final_data, commodity)
        
        # Step 8: Save to CSV
        filename = f"prices_{commodity.lower().replace(' ', '_')}_{market.lower().replace(' ', '_')}.csv"
        final_data.to_csv(filename, index=False)
        print(f"💾 Data saved to: {filename}\n")
        
        # Ask if user wants to search again
        again = input("🔄 Search for another commodity? (y/n): ").strip().lower()
        if again == 'y':
            print("\n" + "="*70 + "\n")
            main()
    else:
        print("❌ No data found for the selected criteria.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"An error occurred in main(): {e}")