/** @type {import("@commitlint/types").UserConfig} */
module.exports = {
    extends: [
        "@commitlint/config-conventional",
    ],
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "build",
                "chore",
                "ci",
                "deprecate",
                "docs",
                "feat",
                "fix",
                "merge",
                "perf",
                "refactor",
                "remove",
                "revert",
                "style",
                "test"
            ]
        ],
        "scope-empty": [ 2, "always" ]
    }
};