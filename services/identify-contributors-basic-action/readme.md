# Kudos Identify Contributors Action

This likely runs on build, extracts the contributors for kudos creation.

## Inputs

## `path`

**Required** The path to look in. Default `.`.

## Outputs

## `contributors`

All contributors found.

## Example usage

uses: services/identify-contributors-basic-action
with:
  path: '.'
