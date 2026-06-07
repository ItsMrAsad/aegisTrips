from google.genai import types

GEMINI_TOOL = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="execute_secure_booking",
            description=(
                "Books a corporate trip securely via the Terminal 3 TEE enclave. "
                "Provide only destination, cost, and trip_type. "
                "Never pass credit card numbers, passport details, or any credentials — "
                "those are managed exclusively by the secure enclave."
            ),
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "destination": types.Schema(
                        type=types.Type.STRING,
                        description="City or country to travel to (e.g., 'Munich', 'Tokyo')",
                    ),
                    "cost": types.Schema(
                        type=types.Type.NUMBER,
                        description="Total estimated cost in USD",
                    ),
                    "trip_type": types.Schema(
                        type=types.Type.STRING,
                        enum=["flight", "hotel", "both"],
                        description="Type of booking to make",
                    ),
                },
                required=["destination", "cost", "trip_type"],
            ),
        )
    ]
)
