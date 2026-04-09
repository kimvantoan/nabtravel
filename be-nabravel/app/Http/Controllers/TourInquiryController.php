<?php

namespace App\Http\Controllers;

use App\Models\TourInquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TourInquiryController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tour_id' => 'required|string',
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',
            'infants' => 'nullable|integer|min:0',
            'arrival_date' => 'required|date',
            'accommodations' => 'required|string',
            'gender' => 'required|string',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone_number' => 'required|string|max:50',
            'country' => 'required|string',
            'city' => 'nullable|string|max:255',
            'social_media' => 'nullable|string|max:255',
            'special_requirements' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $inquiry = TourInquiry::create($validator->validated());

        return response()->json([
            'message' => 'Tour inquiry submitted successfully!',
            'data' => $inquiry
        ], 201);
    }
}
