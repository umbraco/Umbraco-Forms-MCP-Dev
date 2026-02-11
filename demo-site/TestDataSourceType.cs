using Umbraco.Forms.Core;
using Umbraco.Forms.Core.Enums;
using Umbraco.Forms.Core.Models;
using Umbraco.Forms.Core.Persistence.Dtos;

namespace demo_site;

public class TestDataSourceType : FormDataSourceType
{
    public TestDataSourceType()
    {
        Id = new Guid("12345678-0000-0000-0000-000000000001");
        Name = "Test Data Source";
        Description = "Simple data source for integration testing";
    }

    public override List<Exception> ValidateSettings() => new();

    public override Dictionary<object, FormDataSourceField> GetAvailableFields() => new();

    public override Dictionary<object, FormDataSourceField> GetMappedFields() => new();

    public override List<Record> GetRecords(Form form, int page, int maxItems, object sortByField, RecordSorting order) => new();

    public override Record InsertRecord(Record record) => record;

    public override Dictionary<object, string> GetPreValues(Field field, Form form) => new();

    public override void Dispose() { }
}
