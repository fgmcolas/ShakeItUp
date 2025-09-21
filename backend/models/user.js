import mongoose from "mongoose";

// Simple email regex (routes should also validate)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const UserSchema = new mongoose.Schema(
    {
        // Display name (case preserved). We store usernameLower for CI uniqueness.
        username: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 32,
        },
        usernameLower: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 32,
            select: false, // not needed in normal queries
        },

        // Email (lowercased). Unique index at field level.
        email: {
            type: String,
            required: true,
            unique: true, // keep this
            trim: true,
            lowercase: true,
            maxlength: 254,
            match: EMAIL_REGEX,
        },

        // Password hash (bcrypt). Never selected by default.
        password: {
            type: String,
            required: true,
            minlength: 60, // bcrypt hash length
            maxlength: 128,
            select: false,
        },

        // Domain fields
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cocktail" }],
        ingredients: {
            type: [String],
            default: [],
            validate: {
                validator: (arr) => arr.every((s) => typeof s === "string" && s.length <= 64),
                message: "Each ingredient must be a string up to 64 chars.",
            },
        },
    },
    { timestamps: true }
);

// Case-insensitive uniqueness for username
// Note: do not duplicate the unique index on email (already on field).
UserSchema.index({ usernameLower: 1 }, { unique: true });

// Keep usernameLower consistent with username
UserSchema.pre("validate", function (next) {
    if (this.isModified("username")) {
        this.usernameLower = String(this.username || "").toLowerCase().trim();
    }
    next();
});

export default mongoose.model("User", UserSchema);
