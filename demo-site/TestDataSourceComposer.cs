using Umbraco.Cms.Core.Composing;
using Umbraco.Forms.Core.Providers;

namespace demo_site;

public class TestDataSourceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.WithCollectionBuilder<DataSourceTypeCollectionBuilder>()
            .Add<TestDataSourceType>();
    }
}
