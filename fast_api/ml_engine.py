def predict_demand(base_demand, product_type: str, temperature: float):
    """
    A simple rule-based formula to simulate Machine Learning predictions.
    """
    
    # --- HEAT_BOOST LOGIC ---
    if product_type == "HEAT_BOOST":
        if temperature > 28.0:
            predicted_demand = int(base_demand * 1.50)  # Hot days: +50%
        elif temperature < 15.0:
            predicted_demand = int(base_demand * 0.50)  # Cold days: -50%
        else:
            # Captures temperatures from 15.0 up to 28.0 (Normal weather)
            predicted_demand = base_demand

    # --- COLD_BOOST LOGIC ---
    elif product_type == "COLD_BOOST":
        if temperature < 10.0:
            predicted_demand = int(base_demand * 1.20)  # Cold days: +20%
        elif temperature > 15.0:
            predicted_demand = int(base_demand * 0.40)  # Hot days: -40% (40% remaining)
        else:
            # Captures temperatures from 10.0 up to 15.0 (Normal cold-climate weather)
            predicted_demand = base_demand

    else:
        predicted_demand = base_demand # like how it was normally being sold(base)
    

    # Make sure we never predict a negative number of items
    return max(0, predicted_demand)
