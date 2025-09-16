import mongoose from "mongoose";

// Simple email regex (server-side validation; routes should also validate)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const UserSchema = new mongoose.Schema(
    {
        /**
         * Human-friendly username (case preserved for display)
         * - We also store a lowercase version in "usernameLower" to enforce
         *   case-insensitive uniqueness via an index.
         */
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

        /**
         * Email
         * - Stored in lowercase
         * - Unique index (field-level)
         */
        email: {
            type: String,
            required: true,
            unique: true,   // <-- keep this
            trim: true,
            lowercase: true,
            maxlength: 254,
            match: EMAIL_REGEX,
        },

        /**
         * Password hash
         * - Never selected by default for safety
         */
        password: {
            type: String,
            required: true,
            minlength: 60, // bcrypt hash length
            maxlength: 128,
            select: false,
        },

        /**
         * Favorites / ingredients (example domain fields)
         */
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

/**
 * Indexes
 * - Unique usernameLower for case-insensitive username uniqueness
 * NOTE: Do NOT duplicate the email index; `email` already has `unique: true`.
 */
UserSchema.index({ usernameLower: 1 }, { unique: true }); // keep this one

/**
 * Pre-validate hook to ensure usernameLower consistency
 */
UserSchema.pre("validate", function (next) {
    if (this.isModified("username")) {
        this.usernameLower = String(this.username || "").toLowerCase().trim();
    }
    next();
});

export default mongoose.model("User", UserSchema);
